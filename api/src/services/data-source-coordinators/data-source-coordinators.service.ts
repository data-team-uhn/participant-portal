// Initializes the `data-source-coordinators` service on path `/data-source-coordinators`
import createModel from '../../models/data-source-coordinators.model'
import { DataSourceCoordinators } from './data-source-coordinators.class'
import hooks from './data-source-coordinators.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'data-source-coordinators': DataSourceCoordinators
  }
}

export default function (app: Application) {
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('data-source-coordinators', new DataSourceCoordinators(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('data-source-coordinators')

  service.hooks(hooks)
}
