import { authenticate } from '@feathersjs/authentication'
import { disallow, iff, isProvider, setField, keep, isNot } from 'feathers-hooks-common'

import type { HookOptions } from '../../declarations'
import { isRole, requireRole, setRegisteredDate } from '../../hooks'
import type { Coordinators } from './coordinators.class'

const creatableFields = ['user_id', 'institution', 'name_prefix', 'position']
const patchableFields = ['institution', 'name_prefix', 'position']
const adminPatchableFields = [...patchableFields, 'approved']

const hooks: HookOptions<Coordinators> = {
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
    all: [
      iff(isProvider('external'),
        authenticate('jwt'),
      )
    ],
    find: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isNot(isRole('admin')),
          setField({ from: 'params.user.id', as: 'params.query.user_id' })
        )
      )
    ],
    get: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isNot(isRole('admin')),
          setField({ from: 'params.user.id', as: 'params.query.user_id' })
        )
      )
    ],
    create: [
      disallow('external'),
      keep(...creatableFields),
      setRegisteredDate()
    ],
    update: [disallow('external')],
    patch: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('admin'), 
          keep(...adminPatchableFields)
        ),
        iff(isNot(isRole('admin')), 
          setField({ from: 'params.user.id', as: 'params.query.user_id' }),
          keep(...patchableFields)
        )
      )
    ],
    remove: [
      disallow()
    ]
  },

  after: {
    all: [],
    find: [],
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
