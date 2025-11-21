import { UpdateEmail } from './update-email.class'
import hooks from './update-email.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'update-email': UpdateEmail
  }
}

export default function(app: Application) {
  // Initialize our service with any options it requires
  app.use('update-email', new UpdateEmail(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('update-email')

  service.hooks(hooks)
}
