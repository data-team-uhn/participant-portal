import { authenticate } from '@feathersjs/authentication'
import { Forbidden } from '@feathersjs/errors'
import type { Paginated } from '@feathersjs/feathers'
import {
  disallow,
  fastJoin,
  iff,
  isProvider,
  keep,
  required,
  setNow,
  setField,
  checkContext
} from 'feathers-hooks-common'
import { get, find } from 'lodash'
import moment from 'moment'

import { overridePaginate, requireRole } from '../../hooks'

import type { HookOptions, HookContext } from '../../declarations'
import { RoleEnum } from '../../models/roles.enum'
import { FormsModel, ParticipantModel } from '../../models/declarations'
import constants from '../../constants'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

const requiredFieldsCreate = [
  'form_id',
  'responses',
  'furthest_page',
  'is_complete'
]

const requiredFieldsPatch = [
  'responses',
  'furthest_page',
  'is_complete'
]

// The logic necessary for the consent form table is contained here.
const byStudyId = () => (context: HookContext) => {
  if (context.params.query && context.params.query.hasOwnProperty('$study_id')) {
    const study_id = context.params.query.$study_id
    context.params.sequelize = {
      ...context.params.sequelize,
      nest: true,
      include: [
        {
          model: context.app.services['forms'].Model,
          required: true,
          duplicating: false,
          where: { study_id },
          attributes: []
        }
      ]
    }
    delete context.params.query.$study_id
    return populateParticipant()(context)
  }
}

const requireStudyOwnerFind = () => (context: HookContext) => {
  const { id, role } = context.params.user
  if (role === RoleEnum.COORDINATOR) {
    const forms = get(context.app.services, 'forms')
    context.params.sequelize = {
      ...context.params.sequelize,
      nest: true,
      include: [
        {
          model: forms.Model,
          required: true,
          duplicating: false,
          attributes: [],
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
      ]
    }
  } else if (role === RoleEnum.PARTICIPANT) {
    context.params.sequelize = {
      ...context.params.sequelize,
      nest: true,
      include: [{
        model: context.app.services.participants.Model,
        required: true,
        attributes: [],
        where: { user_id: id }
      }]
    }
  }
  return context
}

const requireStudyParticipant = () => async (context: HookContext) => {
  const { form_id } = context.data
  const { id } = context.params.user
  const forms = get(context.app.services, 'forms')
  const valid_participants = (await context.app.service('participants').find({
    sequelize: {
      nest: true,
      include: [{
        model: context.app.services.studies.Model,
        required: true,
        attributes: [],
        include: [{
          model: forms.Model,
          required: true,
          attributes: [],
          where: { id: form_id }
        }]
      }]
    }
  }) as Paginated<ParticipantModel>
  ).data

  const valid_participant = find(valid_participants, { user_id: id })
  if (!valid_participant) {
    throw new Forbidden('User does not have privileges for this request')
  }
  context.data.participant_id = valid_participant.id
  return context
}

const populateParticipant = () => (context: HookContext) => {
  const sequelize = context.app.get('sequelizeClient')
  const participantResolver = () => async (response: any) => {
    response.participant = (await context.app.service('participants').find({
      query: { id: response.participant_id },
      sequelize: {
        nest: true,
        include: [{
          model: context.app.services.users.Model,
          required: true,
          attributes: ['email', 'first_name', 'last_name']
        }]
      },
      paginate: false
    }))[0]

    return response
  }

  const consentFormResolver = () => async (response: any) => {
    response.form = (await context.app.service('forms').find({
      query: { id: response.form_id },
      sequelize: {
        attributes: ['version', [sequelize.literal('form->>\'title\''), 'title']
        ]
      },
      paginate: false
    }))[0]

    return response
  }

  const resolvers = {
    joins: {
      participant: participantResolver,
      consent_form: consentFormResolver
    }
  }

  return fastJoin(resolvers)(context as any) as any
}

/**
 * Update the participant's contact permission_status when they complete the registry consent.
 */
const updateParticipantConsentStatus = () => async (context: HookContext) => {
  checkContext(context, 'after', ['patch', 'create'], 'updateParticipantConsentStatus')

  const { time } = constants.GET_TIME()

  const {
    is_complete,
    form_id,
    participant_id
  } = context.result

  if (!is_complete) return context

  // Check if the completed form is the Connect consent form
  const connectStudy = await context.app.service('studies').find({
    query: { external_study_id: REGISTRY_EXTERNAL_ID },
    sequelize: {
      nest: true,
      include: [
        {
          model: context.app.services.forms.Model,
          required: true,
          duplicating: false,
          where: { id: form_id, name: 'consent' },
          attributes: []
        }
      ]
    }
  }) as Paginated<FormsModel>

  if (connectStudy.total !== 1) return context

  await context.app.service('participants').patch(participant_id, { contact_permission_confirmed: moment() })

  return context
}

/**
 * Update first and last name in the user table based on the response
 */
const updateUserFields = () => async (context: HookContext) => {
  const { result } = context
  if (!result.is_complete) return context

  const first_name = get(result.responses, 'first-name')
  const last_name = get(result.responses, 'last-name')
  const birthdate = get(result.responses, 'birthdate')
  const participant_id = get(context, 'result.participant_id')

  let participant

  if (birthdate) {
    participant = await context.app.service('participants').patch(participant_id, { birthdate }) as unknown as ParticipantModel
  }
  if (!participant) {
    participant = await context.app.service('participants').get(participant_id)
  }

  if (first_name && last_name) {
    const user_id = participant.user_id as unknown as string
    await context.app.service('users').patch(user_id, { first_name, last_name })
  }
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
        byStudyId(),
        requireStudyOwnerFind(),
        overridePaginate()
      )
    ],
    get: [
      iff(isProvider<HookContext>('external'),
        requireStudyOwnerFind()
      )
    ],
    create: [
      iff(isProvider<HookContext>('external'),
        requireRole('participant'),
        keep(...requiredFieldsCreate),
        required(...requiredFieldsCreate),
        requireStudyParticipant(),
        setNow('last_updated_at')
      )
    ],
    update: [disallow('external')],
    patch: [
      iff(isProvider<HookContext>('external'),
        requireRole('participant'),
        keep(...requiredFieldsPatch),
        required(...requiredFieldsPatch),
        setField({ from: 'params.user.participant.id', as: 'params.query.participant_id' }),
        setNow('last_updated_at')
      )
    ],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      updateParticipantConsentStatus(),
      updateUserFields()
    ],
    update: [],
    patch: [
      updateParticipantConsentStatus(),
      updateUserFields()
    ],
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
