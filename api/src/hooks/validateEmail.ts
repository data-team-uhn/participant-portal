import { BadRequest } from '@feathersjs/errors'
import { checkContext } from 'feathers-hooks-common'
import get from 'lodash/get'

import type { HookContext } from '../declarations'

/**
 * Validates an email address at a provided path in the context.data.
 *
 * If a path isn't provided, it defaults to 'email'.
 *
 * @param {string} path - The path to the email address in the context.
 */
const validateEmail = (path?: string) => (context: HookContext) => {
  checkContext(context, 'before', ['create', 'patch'], 'validateEmail')

  const isValidEmail = (email: string) => {
    //(no spaces)@(no spaces).(no spaces)(last character is not . or space)
    const email_regex = /^(\S+)@(\S+)[.](\S*)[^.\s]+$/g

    return email && get(email.match(email_regex), '[0]')
  }

  const dataPath = path || 'email'
  const email = get(context, `data.${dataPath}`, '')

  if (!isValidEmail(email)) {
    throw new BadRequest('Validation errors', {
      errors: [ {
        path: dataPath,
        message: 'Please enter a valid email address.'
      } ]
    })
  }

  return context
}

export default validateEmail
