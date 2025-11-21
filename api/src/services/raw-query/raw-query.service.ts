import { RawQueryService } from './raw-query.class'
import hooks from './raw-query.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'raw-query': RawQueryService
  }
}

export default function (app: Application) {
  // Initialize our service with any options it requires
  app.use('raw-query', new RawQueryService(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('raw-query')

  service.hooks(hooks)
}
