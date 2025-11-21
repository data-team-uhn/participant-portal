// Initializes the `data-source-invitations` service on path `/data-source-invitations`
import createModel from '../../models/data-source-invitations.model'
import { DataSourceInvitations } from './data-source-invitations.class'
import hooks from './data-source-invitations.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'data-source-invitations': DataSourceInvitations
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
  app.use('data-source-invitations', new DataSourceInvitations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('data-source-invitations')

  service.hooks(hooks)
}
