import createModel from '../../models/messages.model'
import { Messages } from './messages.class'
import hooks from './messages.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'messages': Messages
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
  app.use('messages', new Messages(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('messages')

  service.hooks(hooks)
}
