import type { LocalStrategy } from '@feathersjs/authentication-local'
import type { Paginated, Id } from '@feathersjs/feathers'
import { BadRequest, Forbidden, NotAuthenticated } from '@feathersjs/errors'
import { toLower } from 'lodash'

import { Application } from '../../declarations'
import { UserModel } from '../../models/declarations'
import { RoleEnum } from '../../models/roles.enum'

interface UpdateEmailData {
  currentEmail: string
  newEmail: string
  verifyToken: string
  verifyExpires: Date
  currentPassword?: string
  currentVerifyToken?: string
}

export class UpdateEmail {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async validatePassword(user: UserModel, dataPassword: string): Promise<boolean> {
    const localAuthStrategy = this.app.service('authentication').getStrategy('local') as LocalStrategy

    try {
      const entity = await localAuthStrategy.comparePassword(user, dataPassword)
      return !!entity
    } catch {
      return false
    }
  }

  validateToken(user: UserModel, token: string): boolean {
    return user.verifyToken === token
  }

  /**
   * Given an existing email, a password, and a new email, update the user's email.
   *
   * A password can be either the user's actual password, or the verification token.
   * This service is intended to be used by participants and coordinators only.
   */
  async create(data: UpdateEmailData) {
    if (!data.currentPassword && !data.currentVerifyToken) {
      throw new BadRequest('currentPassword or currentVerifyToken is required')
    }

    const users = await this.app.service('users').find({
      query: {
        email: toLower(data.currentEmail),
        $limit: 1
      }
    }) as Paginated<UserModel>

    if (users.total !== 1) {
      throw new NotAuthenticated('Invalid credentials provided')
    }

    const user = users.data[0]
    const userId = user.id as unknown as Id

    if (user.role === RoleEnum.ADMIN) {
      throw new Forbidden('Admins are not allowed to change their email via this service')
    }

    const credentialsValid =
      (data.currentPassword && await this.validatePassword(user, data.currentPassword)) ||
      (data.currentVerifyToken && this.validateToken(user, data.currentVerifyToken)) ||
      false


    if (!credentialsValid) {
      throw new NotAuthenticated('Invalid credentials provided')
    }

    return this.app.service('users').patch(userId, {
      email: toLower(data.newEmail),
      isVerified: false,
      verifyToken: data.verifyToken,
      verifyExpires: data.verifyExpires
    })
  }
}
