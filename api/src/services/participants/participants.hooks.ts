import { authenticate } from '@feathersjs/authentication'
import { randomBytes } from 'crypto'
import { checkContext, disallow, iff, isProvider, setField, keep, isNot } from 'feathers-hooks-common'
import { each, get } from 'lodash'
import constants from '../../constants'

import { isRole, setRegisteredDate } from '../../hooks'
import type { Participants } from './participants.class'

import type { HookContext, HookOptions } from '../../declarations'

const creatableFields = ['user_id', 'birthdate', 'mrn', 'data_source_id']
const patchableFields = ['contact_permission_confirmed', 'viewed_registry_consent']

/**
 * Set the external_participant_id field to a random 24 character hex string.
 *
 * TODO: This should be replaced with a proper study_id generation
 *       that meets PCGL requirements.
 */
const setExternalId = () => async(context: HookContext) => {
  const getRandomId = async function getToken(): Promise<string> {
    return await new Promise((resolve, reject) => {
      randomBytes(12, (error, buffer) => {
        if (error) {
          return reject(error)
        }
        return resolve(buffer.toString('hex'))
      })
    })
  }

  context.data.external_participant_id = await getRandomId()

  return context
}

const setDates = (...fields: string[]) => (context: HookContext) => {
  checkContext(context, 'before', ['create', 'patch'], 'setDate')

  const { time } = constants.GET_TIME()

  // If a date is provided for the field, set it to the current timestamp
  each(fields, (field) => {
    if (context.data[field] !== undefined) {
      context.data[field] = time
    }
  })

  return context
}

/**
 * Ensure coordinators can only view participants from their data sources
 *
 * Note: This must be called after authenticate and after role check
 * and should only be used for coordinators
 */
const limitViewsToOwnDataSources = () => (context: HookContext) => {
  checkContext(context, 'before', ['find', 'get'], 'limitViewsToOwnDataSources')

  const coordinatorId = get(context, 'params.user.coordinator.id')
  const dataSourcesService = get(context.app.services, 'data-sources')

  context.params.sequelize = {
    nest: true,
    include: [{
      model: dataSourcesService.Model,
      required: true,
      duplicating: false,
      attributes: [],
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
    }]
  }

  context.params.query = { ...context.params.query }

  return context
}

const hooks: HookOptions<Participants> = {
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
        iff(isNot(isRole(['admin', 'coordinator'])),
          setField({ from: 'params.user.id', as: 'params.query.user_id' })
        ),
        iff(isRole('coordinator'),
          limitViewsToOwnDataSources()
        )
      )
    ],
    get: [
      iff(isProvider('external'),
        iff(isNot(isRole(['admin', 'coordinator'])),
          setField({ from: 'params.user.id', as: 'params.query.user_id' })
        ),
        iff(isRole('coordinator'),
          limitViewsToOwnDataSources()
        )
      )
    ],
    create: [
      disallow('external'),
      keep(...creatableFields),
      setRegisteredDate(),
      setExternalId()
    ],
    update: [disallow('external')],
    patch: [
      iff(isProvider('external'),
        iff(isNot(isRole('admin')),
          setField({ from: 'params.user.id', as: 'params.query.user_id' }),
          setDates('contact_permission_confirmed', 'viewed_registry_consent')
        ),
        keep(...patchableFields)
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
