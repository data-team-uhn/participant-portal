import { authenticate } from '@feathersjs/authentication'
import { checkContext, disallow, iff, isProvider, keep } from 'feathers-hooks-common'
import { remove } from 'lodash'

import { requireRole, isRole } from '../../hooks'

import type { HookOptions, HookContext } from '../../declarations'
import type { StudyModel } from '../../models/declarations'
import type { Studies } from './studies.class'
import { RoleEnum } from '../../models/roles.enum'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

const patchableFieldsAdmin = ['title', 'description', 'stage', 'phase', 'type', 'linkId']
const patchableFieldsCoordinator = ['linkId']

const requireOwnUser = () => (context: HookContext) => {
  const { id, role } = context.params.user
  if (role === RoleEnum.PARTICIPANT || role === RoleEnum.COORDINATOR) {
    const service = `${role}s` as 'participants' | 'coordinators'
    context.params.sequelize = {
      nest: true,
      include: [{
        model: context.app.service(service).Model,
        required: true,
        where: { user_id: id },
        attributes: [],
        through: {
          attributes: []
        }
      }]
    }
  }
  return context
}

const promoteRegistryStudy = () => (context: HookContext) => {
  checkContext(context, 'after', ['find'], 'promoteRegistryStudy')
  const registryStudy = remove(context.result.data, (study: StudyModel) => study.external_study_id === REGISTRY_EXTERNAL_ID)[0]

  if (registryStudy) {
    context.result.data = [
      registryStudy,
      ...context.result.data
    ]
  }

  return context
}

/**
 * We need to allow some unauthenticated find calls for the join page
 * But for that query, limit what information is returned
 * Remove for now since this isn't being used
 */
/*const handleAuthForFind = () => (context: HookContext) => {
  return authenticate('jwt')(context)
    .then(() => {
      requireOwnUser()(context)
      return context
    })
    .catch(() => {
      context.params.query = { ...context.params.query, $limit: 1, $select: ['title', 'description'] }
      return context
    })
}*/

const hooks: HookOptions<Studies> = {
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
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        requireOwnUser()
      )
    ],
    get: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        requireOwnUser()
      )
    ],
    create: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        requireRole('admin')
      )
    ],
    update: [
      disallow()
    ],
    patch: [
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
        requireRole(['admin', 'coordinator']),
        iff<HookContext>(isRole('coordinator'),
          keep(...patchableFieldsCoordinator),
          requireOwnUser()
        )
      ),
      keep(...patchableFieldsAdmin)
    ],
    remove: [
      disallow()
    ]
  },

  after: {
    all: [],
    find: [promoteRegistryStudy()],
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
