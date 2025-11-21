import { Forbidden } from '@feathersjs/errors'
import get from 'lodash/get'
import includes from 'lodash/includes'

import type { HookContext, Roles } from '../declarations'

/**
 * A hook that restricts actions to users signed in as `role`
 *
 * Must be put after authenticate('jwt')
 * @param role
 */
const requireRole = (role: Roles) => (context: HookContext) => {
  const allowedRoles = typeof (role) === 'string' ? [role] : role
  const userRole = get(context, 'params.user.role')

  if (userRole === undefined || !includes(allowedRoles, userRole)) {
    throw new Forbidden('User does not have privileges for this request.')
  }

  return context
}

export default requireRole
