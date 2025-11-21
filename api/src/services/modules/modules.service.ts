import { Modules } from './modules.class'
import hooks from './modules.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    modules: Modules
  }
}

export default function(app: Application) {
  // Initialize our service with any options it requires
  app.use('modules', new Modules(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('modules')

  service.hooks(hooks)
}
