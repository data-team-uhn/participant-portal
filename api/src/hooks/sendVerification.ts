import type { Paginated } from '@feathersjs/feathers'
import { BadRequest, GeneralError } from '@feathersjs/errors'
import type { User } from 'feathers-authentication-management'
import { checkContext } from 'feathers-hooks-common'

import type { HookContext } from '../declarations'
import type { UserModel } from '../models/declarations'
import makeNotifier from '../services/auth-management/notifier'

/**
 * Sends a verification email to the user with a link to verify their email.
 */
const sendVerification = () => async (context: HookContext) => {
  checkContext(context, 'after', ['create', 'patch'], 'sendVerification')

  // Contact info could be in two formats depending on how the function is called
  // When sending the verification link after sign up (in the users after create hook) the email is in context.result along with the other user info
  // When resending the verification link (if the current token is expired) the context.data includes the action which is 'resendVerifySignup' and the value is the user's email
  const { email } = context.data.action ? context.data.value : context.result
  const action = context.data.action || 'sendVerifySignup'

  if (!email) {
    throw new BadRequest('Email is required to send verification message')
  }

  const result = (
    await context.app.service('users').find({ query: { email } })
  ) as Paginated<UserModel>

  if (result.total === 0) {
    throw new BadRequest('Failed to send verification message')
  }

  const user = result.data[0] as unknown as User

  return await makeNotifier(context.app)(action, user)
    .then(() => context)
    .catch((err: any) => {
      console.log(err)
      throw new GeneralError('Failed to send verification message')
    })
}

export default sendVerification
