import createModel from '../../models/forms.model'
import { Forms } from './forms.class'
import hooks from './forms.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    forms: Forms
  }
}

export default function (app: Application) {
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    Model,
    paginate,

    filters: {
      // Feathers requires specifying sequelize operators here if they are used in queries
      // https://github.com/feathersjs-ecosystem/feathers-sequelize?tab=readme-ov-file#filters
      '$or': true,
      // Allow filtering by whether a form as a response
      // Use underscores to match the table name and surround with $ to escape the underscores
      '$form_responses.id$': true,
      '$form_responses.is_complete$': true
    } as const
  }

  // Initialize our service with any options it requires
  app.use('forms', new Forms(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('forms')

  service.hooks(hooks)
}
