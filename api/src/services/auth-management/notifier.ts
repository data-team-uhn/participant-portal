import type { User } from 'feathers-authentication-management'
import { includes, keys } from 'lodash'

import type { Application } from '../../declarations'

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

interface Templates {
  [key: string]: string
}

const templates: Templates = {
  'sendVerifySignup': 'verification',
  'resendVerifySignup': 'verification',
  'sendResetPwd': 'passwordReset'
}

const actionsWithEmails = keys(templates)

const makeNotifier = (app: Application) => {
  function getLink(action: string, user: Partial<User>) {
    const url = new URL(APP_BASE_URL)

    switch (action) {
      case 'verifySignup':
      case 'resendVerifySignup':
      case 'sendVerifySignup':
        if (!user.verifyToken) {
          throw new Error('User does not have a verification token')
        }
        url.pathname = '/verify'
        url.searchParams.append('token', user.verifyToken)
        url.searchParams.append('email', user.email)
        break
      case 'sendResetPwd':
        if (!user.resetToken) {
          throw new Error('User does not have a verification token')
        }
        url.pathname = '/reset-password'
        url.searchParams.append('token', user.resetToken)
        break
    }

    return url.toString()
  }

  async function sendEmail(user: Partial<User>, template: string, templateParams: Record<string, any>) {
    const { id: user_id, email } = user

    return await app.service('messages').create({
      user_id,
      email,
      template,
      type: template,
      templateParams
    }).catch((error: any) => {
      if (error.name === 'TooManyRequests') {
        throw error
      }
      console.error('Error sending email:', error)
    })
  }

  // eslint-disable-next-line no-unused-vars
  return async function(type: string, user: Partial<User>, notifierOptions: Record<string, any> = {}) {
    const { skipEmail = false } = notifierOptions

    // Auth management tries to send a confirmation email once a user has verified their email.
    // Add the skipEmail option to avoid sending an email in this case.
    if (skipEmail) {
      return
    }

    if (!includes(actionsWithEmails, type)) {
      console.log(`Notifier: action "${type}" does not have an email template associated with it.`)
      return
    }

    const tokenLink = getLink(type, user)
    const templateParams = {
      url: tokenLink
    }

    return await sendEmail(user, templates[type], templateParams)
  }
}


export default makeNotifier
