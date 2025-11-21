import { authenticate } from '@feathersjs/authentication'
import { iff, isProvider } from 'feathers-hooks-common'
import { requireRole } from '../../hooks'

import type { HookOptions, HookContext } from '../../declarations'

const hooks: HookOptions = {
  around: {
    all: [],
    find: [],
  },

  before: {
    all: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        requireRole(['admin', 'coordinator']),
      )
    ],
    find: [ ],
  },

  after: {
    all: [],
    find: [],
  },

  error: {
    all: [],
    find: [],
  }
}

export default hooks
