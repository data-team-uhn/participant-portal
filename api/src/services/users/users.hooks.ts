import { authenticate } from '@feathersjs/authentication'
import * as local from '@feathersjs/authentication-local'
import { addVerification } from 'feathers-authentication-management'
import { BadRequest } from '@feathersjs/errors'
import {
  disallow,
  discard,
  iff,
  isProvider,
  keep,
  lowerCase,
  setField,
  iffElse,
  populate,
  checkContext
} from 'feathers-hooks-common'
import get from 'lodash/get'
import Bluebird from 'bluebird'

import constants from '../../constants'
import type { HookOptions, HookContext } from '../../declarations'
import { validateEmail, sendVerification } from '../../hooks/index'
import type { Users } from './users.class'
import type { CoordinatorModel } from '../../models/declarations'
import { RoleEnum } from '../../models/roles.enum'

const { hashPassword } = local.hooks

const patchableFields = ['first_name', 'last_name', 'email', 'subscribed']

const updateModels = () => async(context: HookContext) => {
  const transaction = context.params.sequelize.transaction

  if (!transaction) {
    throw new Error('No transaction found in context.params')
  }

  const { id: user_id, role } = context.result
  const data = {
    ...context.data,
    user_id,
  }

  const { data_source_ids } = data

  if (role === RoleEnum.PARTICIPANT) {
    if (data_source_ids.length !== 1) throw new BadRequest('Participants can only have one data source')
    await context.app.service('participants').create({...data, data_source_id: data_source_ids[0]}, { sequelize: { transaction } })
  } else if (role === RoleEnum.COORDINATOR) {
    const coordinator = await context.app.service('coordinators').create(data, { sequelize: { transaction } }) as CoordinatorModel
    await Bluebird.each(data_source_ids, (data_source_id: string) =>
      context.app.service('data-source-coordinators').create({coordinator_id: coordinator.id, data_source_id}, { sequelize: { transaction } })
    )
  }
  return context
}

const populateUser = () => (context : HookContext) => {
  const { role } = context.result
  if (role === RoleEnum.PARTICIPANT) {
    return populate({
      schema: {
        include: [
          {
            service: 'participants',
            nameAs: 'participant',
            parentField: 'id',
            childField: 'user_id',
          }
        ]
      }
    })(context)
  } else if (role === RoleEnum.COORDINATOR) {
    return populate({
      schema: {
        include: [
          {
            service: 'coordinators',
            nameAs: 'coordinator',
            parentField: 'id',
            childField: 'user_id',
          }
        ]
      }
    })(context)
  }
}

/**
 * Users may need to reset their email before they have verified.
 *
 * If the user is unverified, trim the data to email only. If email is not
 * present in the data, throw an error.
 */
const checkVerification = () => async(context: HookContext) => {
  checkContext(context, 'before', 'patch', 'checkVerification')
  const isVerified = get(context, 'params.user.isVerified')
  const data = get(context, 'data')
  const email = get(data, 'email')

  if (!isVerified && email) {
    context.data = { email }
    return context
  }

  if (!isVerified) {
    throw new BadRequest('User\'s email is not yet verified.')
  }

  return context
}

/**
 * Change a user's email and require them to reverify their account.
 *
 * This hook should be used in the `before` context for `patch` methods. It ensures that the
 * email in the request data is transformed, validated, and updated appropriately.
 *
 * - Converts the email in `data.email` to lowercase.
 * - Compares the email with the user's current email (`params.user.email`).
 * - If the email is unchanged or not provided in data, return early.
 * - Validates the email (and throw an error if invalid).
 * - Adds email verification logic to the context. The user will
 *   become unverified and a verification token will be created.
 */
const handleEmailChange = () => (context: HookContext) => {
  checkContext(context, 'before', ['patch'], 'handleEmailChange')
  const email = get(context, 'data.email', '')
  const prevEmail = get(context, 'params.user.email', '')
  const lowercaseEmail = email.toLowerCase()

  if (!lowercaseEmail || email === prevEmail) {
    context.data.email = undefined
    return context
  }

  context.data.email = lowercaseEmail
  // throws an error if the email is not valid
  validateEmail()(context)

  addVerification()(context)
  return context
}

const emailChanged = (context: HookContext) => {
  checkContext(context, 'after', ['patch'], 'emailChanged')
  return context.data.email && (context.data.email === context.result.email)
}

const hooks: HookOptions<Users> = {
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
      disallow('external')
    ],
    get: [
      iff(isProvider('external'),
        authenticate('jwt'),
        setField({ from: 'params.user.id', as: 'id' })
      )
    ],
    create: [ // User creation is done through the registration service
      disallow('external'),
      hashPassword('password'),
      addVerification(),
      lowerCase('email'),
    ],
    update: [
      disallow('external'),
    ],
    patch: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        checkVerification(),
        setField({ from: 'params.user.id', as: 'id' }),
        keep(...patchableFields),
        handleEmailChange()
      ),
      lowerCase('email')
    ],
    remove: [
      disallow('external'),
    ]
  },

  after: {
    all: [],
    find: [
      populateUser(),
      // Make sure the password field is never sent to the client
      // Must always be the last hook
      iffElse(isProvider('external'),
        discard(...constants.USER_SENSITIVE_FIELDS),
      )
    ],
    get: [
      populateUser(),
      // Make sure the password field is never sent to the client
      // Must always be the last hook
      iffElse(isProvider('external'),
        discard(...constants.USER_SENSITIVE_FIELDS),
      )
    ],
    create: [
      updateModels(),
      populateUser(),
      // Make sure the password field is never sent to the client
      // Must always be the last hook
      iffElse(isProvider('external'),
        discard(...constants.USER_SENSITIVE_FIELDS),
      )
    ],
    update: [],
    patch: [
      iff(emailChanged, sendVerification()),
      // Make sure the password field is never sent to the client
      // Must always be the last hook
      iffElse(isProvider('external'),
        discard(...constants.USER_SENSITIVE_FIELDS),
      )
    ],
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
