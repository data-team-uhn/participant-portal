import { authenticate } from '@feathersjs/authentication'
import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { type Paginated } from '@feathersjs/feathers'
import { randomBytes } from 'crypto'
import { discard, checkContext, disallow, iff, isProvider, keep, required, lowerCase } from 'feathers-hooks-common'
import { get, map, remove } from 'lodash'
import Bluebird from 'bluebird'

import type { HookContext, HookOptions } from '../../declarations'
import { beginTransaction, commitTransaction, isRole, requireRole, rollbackTransaction, sendInvitation, validateEmail } from '../../hooks'
import { DataSourceModel } from '../../models/declarations'
import { RoleEnum } from '../../models/roles.enum'
import type { Studies } from '../studies/studies.class'
import type { Invitations } from './invitations.class'
import { InvitationModel, MessageModel } from '../../models/declarations'

const MAX_CONTACT_TIMES = Number(process.env.MAX_CONTACT_TIMES) || 5

const createFields = ['type', 'study_id', 'recipient', 'data_source_ids']
const patchableFields = ['sent_by', 'revoked_by']

/**
 * Generate a random token with 48 characters for the invitation.
 */
const generateToken = () => async (context: HookContext) => {
  const getToken = async function getToken(): Promise<string> {
    return await new Promise((resolve, reject) => {
      randomBytes(48, (error, buffer) => {
        if (error) {
          return reject(error)
        }
        return resolve(buffer.toString('hex'))
      })
    })
  }

  context.data.token = await getToken()

  return context
}

/**
 * Set the creator of the invitation to the user who created it.
 *
 * This ignores the user data and adds the user id from context.params.user
 */
const setCreator = () => (context: HookContext) => {
  checkContext(context, 'before', ['create'], 'setCreator')
  if (!context.params.user) {
    throw new NotAuthenticated('User not authenticated')
  }

  context.data.created_by = context.params.user.id

  return context
}

/**
 * Set the revoker of the invitation to the user who revoked it.
 *
 * This ignores the user data and adds the user id from context.params.user.
 * It also sets the time the invitation was revoked.
 *
 * If the invitation is revoked, the invitation will not be updated.
 */
const setRevoker = () => async (context: HookContext) => {
  checkContext(context, 'before', ['patch'], 'setRevoker')

  if (!context.data.revoked_by) {
    return context
  }

  if (!context.params.user) {
    throw new NotAuthenticated('User not authenticated')
  }

  // Only update revoked status if revoked isn't already set
  const query = context.params.query
  context.params.query = { ...query, revoked_by: { $eq: null } }

  // Update data to set current user as the revoker
  context.data.revoked_by = context.params.user.id
  context.data.revoked_at = new Date()

  // Preset a custom error message
  context.error = new NotFound('Invitation does not exist or has already been revoked')

  return context
}

/**
 * Coordinators can only view participant invitations for their own studies and for data sources they have access to.
 *
 * This hook should come after a role check for coordinators.
 */
const protectViews = () => (context: HookContext) => {
  checkContext(context, 'before', ['find', 'get', 'patch'], 'protectViews')

  const { id: user_id } = context.params.user

  context.params.sequelize = {
    nest: true,
    include: [
      {
        model: context.app.services.studies.Model,
        required: true,
        duplicating: false,
        attributes: [],
        include: [{
          model: context.app.services.coordinators.Model,
          required: true,
          duplicating: false,
          where: { user_id },
          attributes: [],
          through: {
            attributes: []
          }
        }]
      },
      {
        model: context.app.services['data-sources'].Model,
        required: true,
        duplicating: false,
        attributes: [],
        through: {
          attributes: []
        },
        include: [{
          model: context.app.services.coordinators.Model,
          required: true,
          duplicating: false,
          where: { user_id },
          attributes: [],
          through: {
            attributes: []
          }
        }]
      }
    ]
  }

  context.params.query = { ...context.params.query, type: 'participant' }

  return context
}

/**
 * Check if the study exists and that the user can access the study before
 * creating a new invitation.
 */
const limitCreateToOwnStudy = () => async (context: HookContext) => {

  checkContext(context, 'before', ['create', 'patch'], 'limitModificationsToOwnStudy')
  const transaction = context.params.transaction

  if (!transaction) {
    throw new Error('No transaction found in context.params')
  }
  const study_id = get(context, 'data.study_id')
  const user_id = get(context, 'params.user.id')

  if (!study_id) {
    throw new BadRequest('Field study_id does not exist. (required)')
  }

  const study = await context.app.service('studies').find({
    query: {
      id: study_id
    },
    sequelize: {
      transaction,
      nest: true,
      include: [{
        model: context.app.services.coordinators.Model,
        required: true,
        where: { user_id, approved: true }
      }]
    }
  }) as Paginated<Studies>

  if (study.total !== 1) {
    throw new Forbidden('User is not authorized to create invitations for this study')
  }

  return context
}

/**
 * Coordinators can only send invitations to participants.
 */
const limitToParticipantInvites = () => (context: HookContext) => {
  checkContext(context, 'before', ['create'], 'limitToParticipantInvites')
  const type = get(context, 'data.type')

  if (type !== 'participant') {
    throw new Forbidden('User is only authorized for participant invites', { type })
  }

  return context
}

const checkInvitesLeft = () => async(context: HookContext) => {
  checkContext(context, 'before', ['patch'], 'checkTimesLeft')

  const sent_by = get(context, 'data.sent_by')

  //if we aren't sending a new invitation email, this doesn't matter
  if (!sent_by) return context

  //get the recipient and add to context
  const invitation = await context.app.service('invitations').get(context.arguments[0]) as unknown as InvitationModel

  context.data = {...context.data, recipient: invitation.recipient}

  const messages = await context.app.service('messages').find({ 
    query: { email: invitation.recipient, type: 'invitation' }
  }) as Paginated<MessageModel>

  if (messages.total >= MAX_CONTACT_TIMES) throw new Forbidden('Recipient has reached maximum invitations')
  
  return context
}

/**
 * Send an email to the invitation recipient.
 */
const sendInvite = () => (context: HookContext) => {
  checkContext(context, 'after', ['create', 'patch'], 'sendInvite')

  if (context.method === 'create' || !!context.data.sent_by) {
    return sendInvitation()(context)
  }

  return context
}

/**
 * Allows the use of a custom 404 error passed down from the before patch hooks.
 *
 * The patch hooks in this service us query parameter to limit the data that can be updated.
 * Feathers will naturally throw a NotFound error if the invitation is not found
 * when these query hooks are added. We set a custom error to provide more details in the error
 * message, rather than the default NotFound message.
 */
const updateError = () => (context: HookContext) => {
  checkContext(context, 'error', ['patch'], 'updateError')

  const customError = context.original.error
  const errorCode = context.error.code

  if (customError && errorCode === 404) {
    throw customError
  }

  return context
}

/**
 * After creating an invitation, add entries to data_source_invitations table.
 *
 * Ensure that for participant invitations, only one data source is linked.
 * Also ensure that coordinators can only link data sources they have access to.
 */
const addDataSources = () => async (context: HookContext) => {
  checkContext(context, 'after', ['create'], 'addDataSources')
  const transaction = context.params.transaction
  const { user: { role } } = context.params

  if (!transaction) {
    throw new Error('No transaction found in context.params')
  }

  const { data_source_ids, type } = context.data
  const { id } = context.result

  // Drop any data source ids that the coordinator does not have access to
  if (role === RoleEnum.COORDINATOR) {
    const availableDataSources = await context.app.service('data-sources').find({ ...context.params, paginate: false }) as DataSourceModel[]
    const availableDataSourceIds = map(availableDataSources, 'id') as unknown as string[]
    remove(data_source_ids, (id: string) => !availableDataSourceIds.includes(id))
  }

  if (type === 'participant' && data_source_ids.length !== 1) {
    throw new BadRequest('Unable to create invitation')
  }

  await Bluebird.each(data_source_ids, (data_source_id: string) =>
    context.app.service('data-source-invitations').create({
      data_source_id,
      invitation_id: id
    }, { sequelize: { transaction } })
  )
  return context
}

const hooks: HookOptions<Invitations> = {
  around: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  before: {
    all: [
      iff(isProvider('external'),
        authenticate('jwt'),
      )
    ],
    find: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'), protectViews())
      )
    ],
    get: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'), protectViews())
      )
    ],
    create: [
      beginTransaction(),
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'), limitCreateToOwnStudy(), limitToParticipantInvites()),
        required(...createFields),
        keep(...createFields),
        lowerCase('recipient'),
        validateEmail('recipient'),
        generateToken(),
        setCreator()
      ),
    ],
    update: [
      disallow('external')
    ],
    patch: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'), protectViews()),
        keep(...patchableFields),
        checkInvitesLeft(),
        setRevoker()
      )
    ],
    remove: [
      disallow('external')
    ]
  },

  after: {
    all: [],
    find: [
      discard('token')
    ],
    get: [
      discard('token')
    ],
    create: [
      addDataSources(),
      sendInvite(),
      discard('token'),
      commitTransaction()
    ],
    update: [],
    patch: [
      sendInvite(),
      discard('token')
    ],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [rollbackTransaction()],
    patch: [updateError()],
    remove: []
  }
}

export default hooks
