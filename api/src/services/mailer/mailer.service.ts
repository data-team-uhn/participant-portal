import hooks from './mailer.hooks'
import { MailerService } from './mailer.class'

import type { Application } from '../../declarations'


// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'mailer': MailerService
  }
}

export default function (app: Application) {
  app.use('mailer', new MailerService() as any)

  const service = app.service('mailer')

  service.hooks(hooks)
}
