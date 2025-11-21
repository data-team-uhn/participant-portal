// Initializes the `participants` service on path `/participants`
import createModel from '../../models/participants.model'
import { Participants } from './participants.class'
import hooks from './participants.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'participants': Participants
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
  app.use('participants', new Participants(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('participants')

  service.hooks(hooks)
}
