import { keep, required } from 'feathers-hooks-common'

import type { HookOptions } from '../../declarations'
import {
  validateCaptcha
} from '../../hooks'

const requiredFields = ['name', 'subject', 'email', 'message', 'captcha_response']

const hooks: HookOptions = {
  around: {
    all: [],
    create: []
  },

  before: {
    all: [],
    create: [
      keep(...requiredFields),
      required(...requiredFields),
      validateCaptcha()
    ]
  },

  after: {
    all: [],
    create: []
  },

  error: {
    all: [],
    create: []
  }
}

export default hooks
