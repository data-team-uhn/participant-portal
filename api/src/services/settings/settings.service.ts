// Initializes the `settings` service on path `/settings`
import createModel from '../../models/settings.model'
import { Settings } from './settings.class'
import hooks from './settings.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'settings': Settings
  }
}

export default function(app: Application) {
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    Model,
    paginate,
    events: ['newUserCount']
  }

  // Initialize our service with any options it requires
  app.use('settings', new Settings(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('settings')

  service.hooks(hooks)
}
