import { CoordinatorsRawQueryService } from './coordinators-raw-query.class'
import hooks from './coordinators-raw-query.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'coordinators-raw-query': CoordinatorsRawQueryService
  }
}

export default function (app: Application) {
  // Initialize our service with any options it requires
  app.use('coordinators-raw-query', new CoordinatorsRawQueryService(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('coordinators-raw-query')

  service.hooks(hooks)
}
