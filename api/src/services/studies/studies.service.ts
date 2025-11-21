// Initializes the `studies` service on path `/studies`
import createModel from '../../models/studies.model'
import { Studies } from './studies.class'
import hooks from './studies.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'studies': Studies
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
  app.use('studies', new Studies(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('studies')

  service.hooks(hooks)
}
