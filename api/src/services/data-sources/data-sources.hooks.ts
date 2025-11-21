import { authenticate } from '@feathersjs/authentication'
import { disallow, iff, isProvider, checkContext, required, keep } from 'feathers-hooks-common'
import { get } from 'lodash'

import type { HookOptions, HookContext } from '../../declarations'
import { isRole, requireRole } from '../../hooks'
import type { DataSources } from './data-sources.class'

//for now, I can't think of any patchable fields, but I can see that changing once we get more information
const patchableFields: string[] = []
const requiredFields = ['name']

/**
 * Ensure coordinators can only view their data sources
 *
 * Note: This must be called after authenticate and after role check
 * and should only be used for coordinators
 */
const limitViewsToOwnDataSources = () => (context: HookContext) => {
  checkContext(context, 'before', ['find', 'get'], 'limitViewsToOwnDataSources')

  const coordinatorId = get(context, 'params.user.coordinator.id')

  context.params.sequelize = {
    nest: true,
    include: [{
      model: context.app.services.coordinators.Model,
      required: true,
      duplicating: false,
      where: { id: coordinatorId },
      attributes: [],
      through: {
        attributes: []
      }
    }]
  }

  context.params.query = { ...context.params.query }

  return context
}

const hooks: HookOptions<DataSources> = {
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
        iff(isRole('coordinator'),
          limitViewsToOwnDataSources()
        )
      )
    ],
    get: [
      iff(isProvider('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'),
          limitViewsToOwnDataSources()
        )
      )
    ],
    create: [
      iff(isProvider('external'),
        requireRole(['admin'])
      ),
      required(...requiredFields)
    ],
    update: [
      disallow('external')
    ],
    patch: [
      iff(isProvider('external'),
        requireRole(['admin']),
        keep(...patchableFields)
      )
    ],
    remove: [
      disallow('external')
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
