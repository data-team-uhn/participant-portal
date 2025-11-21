// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import '@feathersjs/transport-commons'
import type { AuthenticationResult } from '@feathersjs/authentication'
import type { RealTimeConnection } from '@feathersjs/feathers'

import type { Application } from './declarations'
import { RoleEnum } from './models/roles.enum'
import { get } from 'lodash'


const channels = (app: Application) => {

  /**
   * Emit user counts for online and authenticated users.
   *
   * Every time a user reaches the app, leaves the app, logs in and logs out, update the counts
   * and emit the results to the admin channel. These counts can be used by admins to determine
   * how many users are currently online.
   *
   * totalUsersOnline = all non-admin users on the site
   * totalAuthenticated users = all non-admin authenticated users on the site
   */
  const emitConnectionEvent = () => {
    const data = {
      totalUsersOnline: app.channel('anonymous').length - app.channel('admin').length,
      totalAuthenticatedUsers: app.channel('authenticated').length - app.channel('admin').length
    }
    app.service('settings').emit('newUserCount', data)
  }

  /**
   * When a user visits the site, they will be added to the `anonymous` channel.
   *
   * This will add them to the count of `totalUsersOnline` and register them to listen for banner changes.
   */
  app.on('connection', (connection: RealTimeConnection) => {
    app.channel('anonymous').join(connection)
    emitConnectionEvent()
  })

  /**
   * Update user counts when a user leaves the site
   */
  app.on('disconnect', () => {
    emitConnectionEvent()
  })

  /**
   * Add authenticated users to the `authenticated` channel. They will not be removed from `anonymous`.
   *
   * Admins will also be added to the `admin` channel.
   *
   * User counts are updated.
   */
  app.on('login', (authResult: AuthenticationResult, { connection }: any) => {
    if (connection) {
      app.channel('authenticated').join(connection)

      const isAdmin = get(connection, 'user.role', '') === 'admin'

      if (isAdmin) {
        app.channel('admin').join(connection)
      }

      emitConnectionEvent()
    }
  })

  /**
   * Add user to `anonymous` channel when they log out.
   *
   * Feathers automatically removes users from all channels when they log out,
   * so adding them back preserves the correct user count for users on the site.
   *
   * User counts are updated.
   */
  app.on('logout', (authResult: AuthenticationResult, { connection }: any) => {
    if (connection) {
      app.channel('anonymous').join(connection)
      emitConnectionEvent()
    }
  })

  /**
   * When a setting is patched, send updates to the `admin` adn `anonymous` channels.
   *
   * This will allow real-time updates to the maintenance banner and logout restrictions.
   */
  app.service('settings').publish('patched', (data, context) => {
    const { id, value, updated_at } = context.result
    const editor_name = get(context, 'params.user.first_name')

    return [
      app.channel('admin').send({ id, value, updated_at, editor_name }),
      app.channel('anonymous').send({ id, value })
    ]
  })

  /**
   * Emit updated user counts to the admin channel.
   */
  app.service('settings').publish('newUserCount', () => {
    return app.channel('authenticated').filter(connection => connection.user.role === RoleEnum.ADMIN)
  })
}

export default channels
