import { ModuleResponses } from './module-responses.class'
import hooks from './module-responses.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'module-responses': ModuleResponses
  }
}

export default function(app: Application) {
  // Initialize our service with any options it requires
  app.use('module-responses', new ModuleResponses(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('module-responses')

  service.hooks(hooks)
}
