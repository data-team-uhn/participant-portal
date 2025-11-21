import authManagement from './auth-management/auth-management.service'
import contactForm from './contact-form/contact-form.service'
import dataSources from './data-sources/data-sources.service'
import dataSourceCoordinators from './data-source-coordinators/data-source-coordinators.service'
import dataSourceInvitations from './data-source-invitations/data-source-invitations.service'
import forms from './forms/forms.service'
import formResponses from './form-responses/form-responses.service'
import invitations from './invitations/invitations.service'
import coordinatorsRawQueryService from './coordinators-raw-query/coordinators-raw-query.service'
import invitationValidator from './invitation-validator/invitation-validator.service'
import mailer from './mailer/mailer.service'
import messages from './messages/messages.service'
import moduleResponses from './module-responses/module-responses.service'
import modules from './modules/modules.service'
import rawQuery from './raw-query/raw-query.service'
import registration from './registration/registration.service'
import users from './users/users.service'
import studies from './studies/studies.service'
import participants from './participants/participants.service'
import studyParticipants from './study-participants/study-participants.service'
import coordinators from './coordinators/coordinators.service'
import studyCoordinators from './study-coordinators/study-coordinators.service'
import settings from './settings/settings.service'
import updateEmail from './update-email/update-email.service'

import type { Application } from '../declarations'

export default function (app: Application) {
  app.configure(authManagement)
  app.configure(contactForm)
  app.configure(dataSources)
  app.configure(dataSourceCoordinators)
  app.configure(dataSourceInvitations)
  app.configure(forms)
  app.configure(formResponses)
  app.configure(invitations)
  app.configure(coordinatorsRawQueryService)
  app.configure(invitationValidator)
  app.configure(mailer)
  app.configure(messages)
  app.configure(modules)
  app.configure(moduleResponses)
  app.configure(rawQuery)
  app.configure(registration)
  app.configure(users)
  app.configure(studies)
  app.configure(participants)
  app.configure(studyParticipants)
  app.configure(coordinators)
  app.configure(settings)
  app.configure(studyCoordinators)
  app.configure(updateEmail)
}
