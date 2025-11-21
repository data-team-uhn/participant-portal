import type { AuthenticationRequest } from '@feathersjs/authentication'
import { AuthenticationService, JWTStrategy as FeathersJWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy as FeathersLocalStrategy } from '@feathersjs/authentication-local'
import { Forbidden } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import get from 'lodash/get'

import hooks from './authentication.hooks'
import type { Application } from './declarations'
import type { UserModel } from './models/declarations'

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService
  }
}

const requireVerification = (user: UserModel | undefined) => {
  if (user && !user.isVerified) {
    throw new Forbidden('User is not verified')
  }
}

class JWTStrategy extends FeathersJWTStrategy {
  async authenticate(data: AuthenticationRequest, params: Params) {
    const authResult = await super.authenticate(data, params)
    const user = get(authResult, 'user')

    requireVerification(user)
    return authResult
  }
}

class LocalStrategy extends FeathersLocalStrategy {
  async authenticate(data: AuthenticationRequest, params: Params) {
    const authResult = await super.authenticate(data, params)
    const user = get(authResult, 'user')

    requireVerification(user)
    return authResult
  }
}

export default function(app: Application): void {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
  app.service('authentication').hooks(hooks)
}
