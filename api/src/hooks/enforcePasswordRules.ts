import { BadRequest } from '@feathersjs/errors'
import every from 'lodash/every'
import get from 'lodash/get'

import type { HookContext } from '../declarations'

/**
 * Check that the password provided in context.data passes security requirements.
 */
const enforcePasswordRules = () => (context: HookContext) => {
  const password: string | undefined = get(context.data, 'value.password') || get(context.data, 'password')

  if (!password) {
    // If this is a create call from registration, password must be provided
    // Note, there should already be a required hook that checks this, and this should never actually be reached
    if (context.method === 'create' && context.path === 'registration') {
      throw new BadRequest(
        'Password must be provided during registration',
        { errors: [{ path: 'password', 'message': 'Password is required' }] }
      )
    }
    return context
  }

  const hasOneDigit = /\d/.test(password)
  const hasUpperAndLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password)
  const hasEightChars = password.length >= 8
  const hasSpecialChar = /\W|_/.test(password)

  if (every([ hasOneDigit, hasUpperAndLower, hasEightChars , hasSpecialChar])) {
    return context
  }

  throw new BadRequest(
    'Invalid password',
    {
      errors: [{
        path: 'password',
        message: 'Password must be at least 8 characters long and contain at least one digit, one uppercase letter, and one lowercase letter'
      }] }
  )
}

export default enforcePasswordRules
