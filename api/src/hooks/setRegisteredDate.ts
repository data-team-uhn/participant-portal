import constants from '../constants'

import type { HookContext } from '../declarations'

/**
 * Set the registered field to the current date
 */
const setRegisteredDate = () => (context: HookContext) => {
  const { time } = constants.GET_TIME()

  context.data.registered = time

  return context
}

export default setRegisteredDate
