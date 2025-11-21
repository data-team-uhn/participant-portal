import { disallow } from 'feathers-hooks-common'

import type { HookOptions } from '../../declarations'

const hooks: HookOptions = {
  around: {
    all: [],
    create: []
  },

  before: {
    all: [disallow('external')],
    create: []
  },

  after: {
    all: [],
    create: [],
  },

  error: {
    all: [],
    create: [],
  }
}

export default hooks
