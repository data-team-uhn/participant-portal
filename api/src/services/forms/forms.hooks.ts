import { authenticate } from '@feathersjs/authentication'
import { disallow, iff, isProvider, keep, required } from 'feathers-hooks-common'
import { Forbidden } from '@feathersjs/errors'
import type { Paginated } from '@feathersjs/feathers'

import { requireRole, isRole } from '../../hooks'

import type { HookOptions, HookContext } from '../../declarations'
import type { FormsModel, StudyCoordinatorModel } from '../../models/declarations'
import { RoleEnum } from '../../models/roles.enum'

const requiredFields = [
  'study_id',
  'name',
  'form'
]

const filterOwnedStudies = () => async(context: HookContext) => {
  const { id, role } = context.params.user
  if (role === RoleEnum.COORDINATOR) {
    context.params.sequelize = {
      nest: true,
      include: [
        {
          model: context.app.services.studies.Model,
          required: true,
          duplicating: false,
          attributes: [],
          include: [
            {
              model: context.app.services.coordinators.Model,
              required: true,
              duplicating: false,
              where: { user_id: id },
              attributes: [],
              through: {
                attributes: []
              }
            }
          ]
        },
      ]
    }
  } else if (role === RoleEnum.PARTICIPANT) {
    context.params.sequelize = {
      nest: true,
      include: [
        {
          model: context.app.services.studies.Model,
          required: true,
          duplicating: false,
          attributes: [],
          include: [
            {
              model: context.app.services.participants.Model,
              required: true,
              duplicating: false,
              where: { user_id: id },
              attributes: [],
              through: {
                attributes: []
              }
            }
          ]
        },
      ]
    }
  }
  return context
}

const requireStudyOwner = () => async(context: HookContext) => {
  const { study_id } = context.data
  const { id: user_id } = context.params.user
  const coordinator = await context.app.service('study-coordinators').find({
    query: { study_id },
    sequelize: {
      nest: true,
      include: [
        {
          model: context.app.services.coordinators.Model,
          required: true,
          duplicating: false,
          attributes: [],
          where: { user_id }
        }
      ]
    }
  }) as Paginated<StudyCoordinatorModel>
  //there should only be one study-coordinator for each study/coordinator combo
  //if there's more than 1 that's also an issue
  if (coordinator.total != 1) throw new Forbidden('Coordinator does not have permissions for this study')
  return context
}

const addCreatedBy = () => (context: HookContext) => {
  const { id } = context.params.user
  context.data.created_by = id
  return context
}

/**
 * We don't actually want to patch over any existing form records.
 * Instead, create a new form with a higher version.
 *
 * Forms will be identified by their "name" field
 */
const handlePatch = () => async(context: HookContext) => {
  const { id: created_by } = context.params.user
  const { form, name, study_id } = context.data

  const existingForm = (await context.app.service('forms').find({
    query: {
      study_id,
      name,
      $limit: 1,
      $sort: { version: -1 }
    }
  }) as Paginated<FormsModel>).data[0]

  // Create a new form under the same study with the same name
  const newVersion = await context.app.service('forms').create({
    study_id: existingForm.study_id,
    name: existingForm.name,
    created_by,
    version: existingForm.version + 1,
    form
  })

  // Skip the service method call since we aren't patching by record id
  // https://feathersjs.com/api/hooks#setting-context-result
  context.result = newVersion

  return context
}

const hooks: HookOptions = {
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
      iff(isProvider<HookContext>('external'),
        authenticate('jwt'),
      )
    ],
    find: [
      iff(isProvider<HookContext>('external'),
        filterOwnedStudies()
      )
    ],
    get: [
      iff(isProvider<HookContext>('external'),
        filterOwnedStudies()
      )
    ],
    create: [
      iff(isProvider<HookContext>('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'),
          requireStudyOwner(),
        ),
        keep(...requiredFields),
        required(...requiredFields),
        addCreatedBy()
      )
    ],
    update: [
      disallow('external')
    ],
    patch: [
      iff(isProvider<HookContext>('external'),
        requireRole(['admin', 'coordinator']),
        iff(isRole('coordinator'),
          requireStudyOwner(),
        ),
        keep(...requiredFields),
        required(...requiredFields),
        handlePatch()
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
    update: [],
    patch: [],
    remove: []
  }
}

export default hooks
