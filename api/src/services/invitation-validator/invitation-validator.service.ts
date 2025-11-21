import hooks from './invitation-validator.hooks'
import { InvitationValidatorService } from './invitation-validator.class'

import type { Application } from '../../declarations'


// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'invitation-validator': InvitationValidatorService
  }
}

export default function(app: Application) {
  app.use('invitation-validator', new InvitationValidatorService(app))

  const service = app.service('invitation-validator')

  service.hooks(hooks)
}
