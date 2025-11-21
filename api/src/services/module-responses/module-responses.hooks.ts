import { authenticate } from '@feathersjs/authentication'
import { iff, isProvider, required, setField } from 'feathers-hooks-common'

import type { HookOptions, HookContext } from '../../declarations'
import { isRole, requireRole } from '../../hooks'
import { RoleEnum } from '../../models/roles.enum'

const hooks: HookOptions = {
  around: {
    all: [],
    find: []
  },

  before: {
    all: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
      )
    ],
    find: [
      iff(isProvider<HookContext>('external'),
        // TODO: If we open this to coordinators later, we need to filter on studies and data sources
        requireRole([RoleEnum.PARTICIPANT, RoleEnum.ADMIN]),
        iff<HookContext>(isRole(RoleEnum.PARTICIPANT),
          setField({ from: 'params.user.participant.id', as: 'params.query.participant_id' })
        ),
      )
    ]
  },

  after: {
    all: [],
    find: []
  },

  error: {
    all: [],
    find: []
  }
}

export default hooks
