import { authenticate } from '@feathersjs/authentication'
import { GeneralError } from '@feathersjs/errors'
import { checkContext, disallow, fastJoin, iff, isProvider, required } from 'feathers-hooks-common'
import get from 'lodash/get'

import type { HookContext, HookOptions } from '../../declarations'
import { isRole, overridePaginate, requireRole } from '../../hooks/index'
import type { StudyParticipants } from './study-participants.class'

const requiredFields = ['study_id', 'member_id']


/**
 * Create an id that represents a participants involvement in a study.
 * The id will be created by concatenating the participant id and the
 * study id and will be stored as the `external_id`.
 */
const addExternalId = () => async(context: HookContext) => {
  checkContext(context, 'before', ['create'], 'addExternalId')

  // A transaction may be present if this is part of the user registration.
  // Otherwise, it will be null
  const transaction = context.params.sequelize?.transaction
  const { study_id, member_id } = context.data

  try {
    const study = await context.app.service('studies').get(study_id, { sequelize: { transaction } })
    const participant = await context.app.service('participants').get(member_id, { sequelize: { transaction } })

    context.data.external_id = get(participant, 'external_participant_id', '') + get(study, 'external_study_id', '')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message)
    } else {
      console.log(error)
    }

    throw new GeneralError('Error adding participant to study')
  }

  return context
}

/**
 * Validate a participant's study ID against the PCGL ID manager
 *
 * TODO: Make a request to the PCGL ID manager and wait for a response
 *       Think about how to handle invalid/error responses (regenerate id?).
 *       Does this need to be a background task to avoid holding up the response?
 */
const validateId = () => async(context: HookContext) => {
  checkContext(context, 'after', ['create'], 'validateId')

  // A transaction may be present if this is part of the user registration.
  // Otherwise, it will be null
  const transaction = context.params.sequelize?.transaction
  const { id } = context.result

  await context.app.service('study-participants').patch(id, { id_is_validated: true }, { sequelize: { transaction } })
  context.result.id_is_validated = true

  return context
}

/**
 * Ensure coordinators can only view membership for their own studies
 *
 * Note: This must be called after authenticate and after role check
 * and should only be used for coordinators
 */
const limitViewsToOwnStudies = () => (context: HookContext) => {
  checkContext(context, 'before', ['find'], 'limitViewsToOwnStudies')

  const coordinatorId = get(context, 'params.user.coordinator.id')

  context.params.sequelize = {
    nest: true,
    include: [{
      model: context.app.services.studies.Model,
      required: true,
      duplicating: false,
      attributes: [],
      include: [{
        model: context.app.services.coordinators.Model,
        required: true,
        duplicating: false,
        where: { id: coordinatorId },
        attributes: [],
        through: {
          attributes: []
        }
      }]
    }]
  }

  context.params.query = { ...context.params.query }

  return context
}

const populateFields = () => (context: HookContext) => {
  const participantResolver = () => async(membership: any) => {
    membership.participant = (await context.app.service('participants').find({
      query: { id: membership.member_id },
      sequelize: {
        nest: true,
        include: [{
          model: context.app.services.users.Model,
          required: true,
          attributes: ['email', 'first_name', 'last_name']
        }]
      },
      paginate: false
    }))[0]

    return membership
  }

  const studyResolver = () => async(membership: any) => {
    membership.study = (await context.app.service('studies').find({
      query: { id: membership.study_id },
      paginate: false
    }))[0]

    return membership
  }

  const resolvers = {
    joins: {
      study: studyResolver,
      participant: participantResolver
    }
  }

  return fastJoin(resolvers)(context as any) as any
}

const hooks: HookOptions<StudyParticipants> = {
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
    all: [],
    find: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'),
          limitViewsToOwnStudies()
        ),
        overridePaginate()
      )
    ],
    get: [
      disallow('external')
    ],
    create: [
      disallow('external'),
      required(...requiredFields),
      addExternalId()
    ],
    update: [
      disallow('external')
    ],
    patch: [
      disallow('external')
    ],
    remove: [
      disallow('external')
    ]
  },

  after: {
    all: [],
    find: [
      populateFields()
    ],
    get: [],
    create: [
      validateId()
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    patch: [],
    remove: []
  }
}

export default hooks
