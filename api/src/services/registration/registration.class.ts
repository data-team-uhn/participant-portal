import { BadRequest } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import get from 'lodash/get'
import has from 'lodash/has'
import map from 'lodash/map'

import type { Application, Role } from '../../declarations'

type Email = `${string}@${string}.${string}`

interface UserRegistrationData {
  email: Email
  password: string
  role: Role
}

interface ParticipantRegistrationData extends UserRegistrationData {
  token?: string
  studyLinkId?: string
}

interface CoordinatorRegistrationData extends UserRegistrationData {
  name_prefix?: string
  institution?: string
  position?: string
  token: string
}

export class RegistrationService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: ParticipantRegistrationData | CoordinatorRegistrationData, params: Params) {
    let errors
    const transaction = params.transaction

    if (!transaction) {
      throw new Error('No transaction found in context.params')
    }

    try {
      return await this.app.service('users').create(data,
        { sequelize: { transaction } }
      )
    } catch (error: any) {
      if (has(error, 'errors')) {
        const validationErrors = get(error, 'errors', [])
        errors = map(validationErrors, error => ({ path: error.path, message: error.message }))
      } else {
        console.log(error)
      }

      throw new BadRequest('User cannot be registered', { errors })
    }
  }
}
