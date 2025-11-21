import { addVerification } from 'feathers-authentication-management'
import { discard, required, keep, iff, isProvider } from 'feathers-hooks-common'

import constants from '../../constants/index'
import type { HookOptions } from '../../declarations'

const requiredFields = ['currentEmail', 'newEmail']
const optionalFields = ['currentPassword', 'currentVerifyToken']

const hooks: HookOptions = {
  around: {
    all: [],
    create: []
  },

  before: {
    all: [],
    create: [
      required(...requiredFields),
      keep(...requiredFields, ...optionalFields),
      addVerification() // Adding verification fields here will prompt a verification email to be sent
    ]
  },

  after: {
    all: [],
    create: [
      iff(isProvider('external'),
        discard(...constants.USER_SENSITIVE_FIELDS),
      )
    ]
  },

  error: {
    all: [],
    create: []
  }
}

export default hooks
