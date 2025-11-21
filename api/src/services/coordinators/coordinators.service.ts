// Initializes the `coordinators` service on path `/coordinators`
import createModel from '../../models/coordinators.model'
import { Coordinators } from './coordinators.class'
import hooks from './coordinators.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'coordinators': Coordinators
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
  app.use('coordinators', new Coordinators(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('coordinators')

  service.hooks(hooks)
}
