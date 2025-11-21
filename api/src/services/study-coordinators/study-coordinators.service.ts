// Initializes the `study-coordinators` service on path `/study-coordinators`
import createModel from '../../models/study-coordinators.model'
import { StudyCoordinators } from './study-coordinators.class'
import hooks from './study-coordinators.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'study-coordinators': StudyCoordinators
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
  app.use('study-coordinators', new StudyCoordinators(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('study-coordinators')

  service.hooks(hooks)
}
