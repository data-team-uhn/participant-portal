import get from 'lodash/get'
import includes from 'lodash/includes'

import type { HookContext, Roles, PredicateFunction } from '../declarations'

/**
 * Return true if the user making the request has the appropriate role.
 *
 * Role can be a string or a list of strings.
 *
 * Must be put after authenticate('jwt')
 * @param role
 * @returns PredicateFunction
 */
const isRole = (role: Roles): PredicateFunction => (context: HookContext): boolean => {
  // Wrap a single role in a list to simplify handling role check
  const allowedRoles = typeof (role) === 'string' ? [ role ] : role
  const userRole = get(context, 'params.user.role', null) !== null ? get(context, 'params.user.role') : get(context, 'result.role')

  return userRole !== undefined && includes(allowedRoles, userRole)
}

export default isRole
