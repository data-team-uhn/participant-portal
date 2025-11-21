import { Forbidden } from '@feathersjs/errors'
import type { Paginated } from '@feathersjs/feathers'
import { checkContext, discard, iff, isProvider, keep, required, lowerCase } from 'feathers-hooks-common'
import get from 'lodash/get'

import type { HookContext, HookOptions } from '../../declarations'
import {
  beginTransaction,
  commitTransaction,
  enforcePasswordRules,
  rollbackTransaction,
  sendVerification,
  validateEmail,
  validateInvitation,
  addUserFromStudyLink,
  validateCaptcha
} from '../../hooks'
import constants from '../../constants'
import type { InvitationModel } from '../../models/declarations'
import { RoleEnum } from '../../models/roles.enum'

const requiredFields = [
  'email',
  'password',
  'role',
]

const optionalFieldsParticipant = [
  'token',
  'studyLinkId'
]

const requiredFieldsCoordinator = [
  'token'
]

const optionalFieldsCoordinator = [
  'name_prefix',
  'institution',
  'position'
]

const keepFields = () => (context: HookContext) => {
  const role = context.data.role
  if (role === RoleEnum.PARTICIPANT) return keep(...requiredFields, ...optionalFieldsParticipant)(context)
  else if (role === RoleEnum.COORDINATOR) return keep(...requiredFields, ...requiredFieldsCoordinator, ...optionalFieldsCoordinator)(context)
}

const requireFields = () => (context: HookContext) => {
  const role = context.data.role
  if (role === RoleEnum.PARTICIPANT) return required(...requiredFields)(context)
  else if (role === RoleEnum.COORDINATOR) return required(...requiredFields, ...requiredFieldsCoordinator)(context)
}

/**
 * If an invitation token was included in the registration data,
 * this hook will consume the invitation token after the user has registered.
 *
 * This prevents the invitation from being used again.
 *
 * This hook also adds the user to the correct research study
 * if an invitation was provided.
 */
const consumeInvitation = () => async(context: HookContext) => {
  checkContext(context, 'after', ['create'], 'consumeInvitation')
  const transaction = context.params.transaction

  if (!transaction) {
    throw new Error('No transaction found in context.params')
  }

  const { role, token, email } = context.data
  const { id: userId } = context.result

  // Get the invitation that was sent to the user
  const invitation = await context.app.service('invitations').find({
    query: {
      token,
      recipient: email,
      type: role
    }
  }) as Paginated<InvitationModel>

  if (invitation.total === 0) {
    // This should cause the transaction to rollback
    throw new Forbidden('You do not have permission to register')
  }

  // Add the user the study specified in the invitation
  const {
    id: invitationId,
    study_id
  } = invitation.data[0]

  const member_id = get(context, `result.${role}.id`)
  const studyMembershipService = role === RoleEnum.PARTICIPANT
    ? context.app.service('study-participants')
    : context.app.service('study-coordinators')

  await studyMembershipService.create({ member_id, study_id }, { sequelize: { transaction } })

  // Mark the invitation as consumed by the registered user
  await context.app.service('invitations').patch(invitationId as unknown as string, {
    consumed_by: userId,
    consumed_at: new Date()
  }, {
    sequelize: { transaction }
  })

  return context
}

const hooks: HookOptions = {
  around: {
    all: [],
    create: []
  },

  before: {
    all: [],
    create: [
      beginTransaction(),
      validateCaptcha(),
      keepFields(), // Trim extra data that might be passed
      requireFields(), // Require all fields
      lowerCase('email'),
      validateInvitation(),
      validateEmail(),
      enforcePasswordRules(),
    ]
  },

  after: {
    all: [],
    create: [
      consumeInvitation(),
      addUserFromStudyLink(),
      // sendVerification requires the user to exist, so we must commit transaction first.
      commitTransaction(),
      iff(isProvider('external'),
        sendVerification()
      ),
      discard(...constants.USER_SENSITIVE_FIELDS)
    ]
  },

  error: {
    all: [],
    create: [
      rollbackTransaction()
    ]
  }
}

export default hooks
