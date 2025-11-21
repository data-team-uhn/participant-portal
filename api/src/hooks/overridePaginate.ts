import type { HookContext } from '../declarations'

/**
 * Allow client to override paginate.
 *
 * Feathers doesn't accept params.paginate from the client. With this hook,
 * the client can bypass this by passing $paginate to the query.
 */
const overridePaginate = () => async(context: HookContext) => {
  if (context.params.query && context.params.query.hasOwnProperty('$paginate')) {
    context.params.paginate = context.params.query.$paginate === 'true' || context.params.query.$paginate === true
    delete context.params.query.$paginate
  }
  return context
}

export default overridePaginate
