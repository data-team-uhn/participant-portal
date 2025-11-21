import { BadRequest } from '@feathersjs/errors'
import { every, iff, isProvider } from 'feathers-hooks-common'
import { get } from 'lodash'

import { enforcePasswordRules, validateCaptcha } from '../../hooks'

import type { HookContext, HookOptions } from '../../declarations'

const shouldHideErrorResponse = () => (context: HookContext) => (
  // If a user is requesting a new verification or reset token,
  // we should hide error messages that signal a user doesn't exist.
  (context.data.action === 'resendVerifySignup' || context.data.action === 'sendResetPwd') &&
  context.error.message === 'User not found'
)

const limitToAllowedActions = () => (context: HookContext) => {
  const { action } = context.data
  const allowedActions = ['options', 'addVerification', 'resendVerifySignup', 'verifySignupLong', 'sendResetPwd', 'resetPwdLong', 'reverifyPassword']

  if(!allowedActions.includes(action)) {
    throw new BadRequest('action not allowed')
  }

  return context
}

const hooks: HookOptions = {
  around: {
    all: [],
    create: []
  },

  before: {
    all: [],
    create: [
      limitToAllowedActions(),
      iff(context => get(context, 'data.action', null) === 'resetPwdLong',
        enforcePasswordRules()
      ),
      iff(context => get(context, 'data.action', null) === 'sendResetPwd',
        validateCaptcha()
      )
    ],
  },

  after: {
    all: [],
    create: []
  },

  error: {
    all: [],
    create: [
      iff(every(isProvider('external'), shouldHideErrorResponse()), context => {
        // Ensure the user object is not returned
        context.result = { status: 200 }

        return context
      })
    ]
  }
}

export default hooks
