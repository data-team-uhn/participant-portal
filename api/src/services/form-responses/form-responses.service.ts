import createModel from '../../models/form-responses.model'
import { FormResponses } from './form-responses.class'
import hooks from './form-responses.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'form-responses': FormResponses
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
  app.use('form-responses', new FormResponses(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('form-responses')

  service.hooks(hooks)
}
