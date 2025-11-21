import { authenticate } from '@feathersjs/authentication'
import { disallow, iff, isProvider, checkContext, setField, populate, discard } from 'feathers-hooks-common'

import { requireRole, isRole } from '../../hooks'

import type { HookOptions, HookContext } from '../../declarations'
import type { Settings } from './settings.class'
import { RoleEnum } from '../../models/roles.enum'


/**
 * Authenticate a user if there is a jwt available to authenticate them, otherwise silence error
 */
const checkAuthenticated = () => async(context: HookContext) => {
  try {
    return await authenticate('jwt')(context)
  } catch {
    return context
  }
}

/**
 * Limit data returned to non-admin users.
 *
 * Only the following setting ids should be returned:
 * - banner_on
 * - banner_text
 * - restrict_login
 *
 * Only return the id and the value for each setting
 */
const limitDataReturned = () => (context: HookContext) => {
  checkContext(context, 'before', ['find'], 'limitDataReturned')

  if (context.params.user && context.params.user.role === RoleEnum.ADMIN) {
    return context
  }

  context.params.query = {
    ...context.params.query,
    id: {
      $and: [
        ...context.params.query?.id ? [context.params.query.id] : [],
        { $in: ['banner_on', 'banner_text', 'restrict_login'] }
      ]
    },
    $select: ['id', 'value']
  }

  return context
}

/**
 * Include totalUsersOnline and totalAuthenticatedUsers in the result.
 *
 * These counts only include non-admin users.
 */
const getNumberOfSessions = () => (context: HookContext) => {
  checkContext(context, 'after', ['find'], 'getNumberOfSessions')

  context.result.totalUsersOnline = context.app.channel('anonymous').length - context.app.channel('admin').length
  context.result.totalAuthenticatedUsers = context.app.channel('authenticated').length - context.app.channel('admin').length
  return context
}

/**
 * Populate the admin user that edited the setting
 */
const populateUser = () => (context: HookContext) => {
  checkContext(context, 'after', ['find'], 'populateUser')

  return populate<HookContext>({
    schema: {
      include: [
        {
          service: 'users',
          nameAs: 'editor_name',
          parentField: 'editor_id',
          childField: 'id',
          query: {
            $select: ['first_name', 'last_name']
          }
        }
      ],
      provider: undefined
    }
  })(context)
}

const hooks: HookOptions<Settings> = {
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
      checkAuthenticated(),
      limitDataReturned()
    ],
    get: [
      iff(isProvider('external'), disallow())
    ],
    create: [
      iff(isProvider('external'), disallow())
    ],
    update: [
      iff(isProvider('external'), disallow())
    ],
    patch: [
      iff<HookContext>(isProvider('external'),
        authenticate('jwt'),
        requireRole('admin'),
        setField({ from: 'params.user.id', as: 'data.editor_id' })
      )
    ],
    remove: [
      iff(isProvider('external'), disallow())
    ]
  },

  after: {
    all: [],
    find: [
      iff(isProvider('external'),
        iff<HookContext>(isRole('admin'),
          getNumberOfSessions(),
          populateUser(),
          discard('_include')
        )
      )
    ],
    get: [],
    create: [],
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
