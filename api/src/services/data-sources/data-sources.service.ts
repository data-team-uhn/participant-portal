// Initializes the `data-sources` service on path `/data-sources`
import createModel from '../../models/data-sources.model'
import { DataSources } from './data-sources.class'
import hooks from './data-sources.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'data-sources': DataSources
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
  app.use('data-sources', new DataSources(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('data-sources')

  service.hooks(hooks)
}
