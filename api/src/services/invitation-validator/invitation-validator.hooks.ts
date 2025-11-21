import type { HookOptions } from '../../declarations'
import { validateCaptcha } from '../../hooks/index'

const hooks: HookOptions = {
  around: {
    all: [],
    create: []
  },

  before: {
    all: [],
    create: [
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
