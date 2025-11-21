// A hook that logs service methods around, before, after and error
// Hides authorization headers and logged-in user's password
import { get, map, omit } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { HookContext, NextFunction } from '../declarations'

export default () => {
  return async function(hook: HookContext, next?: NextFunction) {
    try {
      let message = `${ hook.type }: ${ hook.path } - Method: ${ hook.method }`
      if (hook.type === 'error') {
        message += `: ${ get(hook, 'error.message', 'No error object found on hook') }`
      }

      const meta = {
        event_id: uuidv4(),
        method: hook.method,
        service: hook.path,
        type: hook.type,
        audit: true,
        time: new Date().toISOString(),
        data: hook.data ? omit(hook.data, [ 'value.password', 'password', 'accessToken' ]) : undefined,
        params: hook.params ? omit(hook.params, [ 'headers.authorization', 'user.password', 'user.resetToken', 'user.verifyToken', 'authentication.accessToken', 'connection.authentication.accessToken' ]) : undefined,
        response_body: hook.result && hook.result.data
          ? map(hook.result.data, item =>  omit(item, ['accessToken', 'authentication.accessToken', 'password', 'verifyToken', 'resetToken']))
          : omit(hook.result, ['accessToken', 'authentication.accessToken', 'password', 'verifyToken', 'resetToken']),
        prior_values: hook.prior_values ? omit(hook.prior_values, ['password', 'previousPasswords', 'verifyToken', 'resetToken']) : undefined,
        error: hook.error
          ? omit(hook.error, ['hook.data.password', 'hook.arguments[0].password'])
          : hook.error
      }

      // Only audit external requests
      if (process.env.ENVIRONMENT === 'production' && hook.params && hook.params.provider === 'socketio') {
        console.log(`Wrote audit event id ${meta.event_id}`)
        hook.app.get('auditLogger').info(message, omit(meta, [ 'data.password' ]))
      } else if (process.env.ENVIRONMENT === 'development') {
        console.log(message)
      }

      if (hook.type === 'around' && next !== undefined) {
        await next()
      }
    } catch (err) {
      if (hook.error) throw err
      console.error(err)
    }
  }
}
