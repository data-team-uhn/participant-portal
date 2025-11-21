// Initializes the `study-participants` service on path `/study-participants`
import createModel from '../../models/study-participants.model'
import { StudyParticipants } from './study-participants.class'
import hooks from './study-participants.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'study-participants': StudyParticipants
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
  app.use('study-participants', new StudyParticipants(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('study-participants')

  service.hooks(hooks)
}
