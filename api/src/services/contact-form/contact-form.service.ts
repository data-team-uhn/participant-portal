// Initializes the `contact-form` service on path `/contact-form`
import { ContactFormService } from './contact-form.class'

import hooks from './contact-form.hooks'

import type { Application } from '../../declarations'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'contact-form': ContactFormService
  }
}

export default function (app: Application) {

  // Initialize our service with any options it requires
  app.use('contact-form', new ContactFormService(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('contact-form')

  service.hooks(hooks)
}
