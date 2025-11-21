// Authentication hooks
import { discard, iff, isProvider, lowerCase } from 'feathers-hooks-common'
import { map } from 'lodash'

import constants from './constants'
import { addUserFromStudyLink } from './hooks'
import type { HookOptions, HookContext } from './declarations'

const checkStudyInviteLinkOnLocalAuth = () => (context : HookContext) => {
  if (context.data.strategy === 'local') return addUserFromStudyLink()(context)
  else return context
}

const hooks: HookOptions = {
  around: {
    all: [],
    create: [],
    remove: []
  },

  before: {
    all: [],
    create: [
      lowerCase('email')
    ],
    remove: []
  },

  after: {
    all: [
      iff(isProvider('external'),
        discard(...map(constants.USER_SENSITIVE_FIELDS, (field) => `user.${field}`))
      )
    ],
    create: [
      checkStudyInviteLinkOnLocalAuth()
    ],
    remove: []
  },

  error: {
    all: [],
    create: [],
    remove: []
  }
}

export default hooks
