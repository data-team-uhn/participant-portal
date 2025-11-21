import { AuthenticationManagementService } from 'feathers-authentication-management'

import hooks from './auth-management.hooks'

import type { Application } from '../../declarations'
import makeNotifier from './notifier'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'authManagement': AuthenticationManagementService
  }
}

export default function (app: Application) {
  const notifier = makeNotifier(app)

  // half hour, duration for sign up email verification token
  const delay = 1000 * 60 * 30
  // one hour, length that reset link is valid for
  const resetDelay = 1000 * 60 * 60
  const options = {
    delay,
    resetDelay,
    skipIsVerifiedCheck: true,
    identifyUserProps: ['email', 'mrn'],
    sanitizeUserForClient: () => ({ status: 200 }),
    notifier
  }

  // Initialize our service with any options it requires
  app.use('authManagement', new AuthenticationManagementService(app, options))

  // Get our initialized service so that we can register hooks
  const service = app.service('authManagement')

  service.hooks(hooks)
}
