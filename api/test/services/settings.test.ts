import assert from 'assert'
import Bluebird from 'bluebird'
import { cloneDeep, each, find, has } from 'lodash'

import resetDb from '../../scripts/db/reset'
import { Application } from '../../src/declarations'
import client from '../client'
import { createAdmin, createCoordinator, createDataSource, createParticipant } from '../factories'
import server from '../server'
import { ERROR, test, testUserAuthentication, verifyAllUsers } from '../utils'

type SettingType = {
  id: string
  value: string
  editor_id?: string
  editor_name?: {
    first_name?: string
    last_name?: string
    id?: string
  }
  created_at?: string
  updated_at?: string
}

const service = 'settings'

const dataSource = createDataSource({})

const admin = createAdmin({})
const admin2 = createAdmin({})
const coordinatorUser = createCoordinator({ data_source_ids: [dataSource.id] })
const participantUser = createParticipant({ data_source_ids: [dataSource.id] })

const editorName = { first_name: admin.first_name, last_name: admin.last_name, id: admin.id }

const publicSettings: SettingType[] = [
  { id: 'banner_text', value: 'test' },
  { id: 'banner_on', value: 'false' },
  { id: 'restrict_login', value: 'false' }
]
const privateSettings: SettingType[] = [
  { ...publicSettings[0], editor_id: admin.id },
  { ...publicSettings[1], editor_id: admin.id },
  { ...publicSettings[2], editor_id: admin.id },
  { id: 'loggedout_time', value: new Date().toISOString(), editor_id: admin.id }
]

export const createInitialSettings = async (server: Application, settings: SettingType[]) => {
  return Bluebird.each(
    settings,
    async (setting) => server.service('settings').create(setting)
  )
}

describe('\'settings\' service', () => {
  it('registered the service', () => {
    const service = server.service('settings')

    assert.ok(service, 'Registered the service')
  })

  before(async () => {
    try {
      await resetDb(server)

      const sequelize = server.get('sequelizeClient')
      const transaction = await sequelize.transaction()
      const params = { transaction, sequelize: { transaction } }

      await server.service('data-sources').create(dataSource)
      await server.service('users').create(admin, params)
      await server.service('users').create(admin2, params)
      await server.service('users').create(coordinatorUser, params)
      await server.service('users').create(participantUser, params)

      await transaction.commit()

      await verifyAllUsers(server)

      await createInitialSettings(server, privateSettings)
    } catch (err) {
      console.error(err)
      throw err
    }
  })

  describe('find service', () => {
    const method = 'find'

    it('should limit data when not authenticated', async () => {
      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: {}
      })

      assert.deepStrictEqual(result.data, publicSettings)
      assert.ok(!has(result, 'totalUsersOnline'), 'totalUsersOnline should not be present for non-admin users')
      assert.ok(!has(result, 'totalAuthenticatedUsers'), 'totalAuthenticatedUsers should not be present for non-admin users')
    })

    it('should limit data when not authenticated for banner_on', async () => {
      const expected = find(publicSettings, { id: 'banner_on' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_on' } }
      })

      assert.deepStrictEqual(result.data, [expected])
    })

    it('should limit data when not authenticated for banner_text', async () => {
      const expected = find(publicSettings, { id: 'banner_text' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_text' } }
      })

      assert.deepStrictEqual(result.data, [expected])
    })

    it('should limit data when not authenticated for restrict_login', async () => {
      const expected = find(publicSettings, { id: 'restrict_login' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'restrict_login' } }
      })

      assert.deepStrictEqual(result.data, [expected])
    })

    it('should not return loggedout_time when not authenticated', async () => {
      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'loggedout_time' } }
      })

      assert.deepStrictEqual(result.data, [])
    })

    it('should limit data to participants', async () => {
      await testUserAuthentication('subjectID', participantUser.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: {}
      })

      assert.deepStrictEqual(result.data, publicSettings)
      assert.ok(!has(result, 'totalUsersOnline'), 'totalUsersOnline should not be present for non-admin users')
      assert.ok(!has(result, 'totalAuthenticatedUsers'), 'totalAuthenticatedUsers should not be present for non-admin users')
      await client.logout()
    })

    it('should limit data to participants for banner_on', async () => {
      await testUserAuthentication('subjectID', participantUser.id)
      const expected = find(publicSettings, { id: 'banner_on' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_on' } }
      })

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should limit data to participants for banner_text', async () => {
      await testUserAuthentication('subjectID', participantUser.id)
      const expected = find(publicSettings, { id: 'banner_text' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_text' } }
      })

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should limit data to participants for restrict_login', async () => {
      await testUserAuthentication('subjectID', participantUser.id)
      const expected = find(publicSettings, { id: 'restrict_login' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'restrict_login' } }
      })

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should not return loggedout_time to participants', async () => {
      await testUserAuthentication('subjectID', participantUser.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'loggedout_time' } }
      })

      assert.deepStrictEqual(result.data, [])
      await client.logout()
    })

    it('should limit data to coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: {}
      })

      assert.deepStrictEqual(result.data, publicSettings)
      assert.ok(!has(result, 'totalUsersOnline'), 'totalUsersOnline should not be present for non-admin users')
      assert.ok(!has(result, 'totalAuthenticatedUsers'), 'totalAuthenticatedUsers should not be present for non-admin users')
      await client.logout()
    })

    it('should limit data to coordinators for banner_on', async () => {
      await testUserAuthentication('subjectID', coordinatorUser.id)
      const expected = find(publicSettings, { id: 'banner_on' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_on' } }
      })

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should limit data to coordinators for banner_text', async () => {
      await testUserAuthentication('subjectID', coordinatorUser.id)
      const expected = find(publicSettings, { id: 'banner_text' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_text' } }
      })

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should limit data to coordinators for restrict_login', async () => {
      await testUserAuthentication('subjectID', coordinatorUser.id)
      const expected = find(publicSettings, { id: 'restrict_login' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'restrict_login' } }
      })

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should not return loggedout_time to coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'loggedout_time' } }
      })

      assert.deepStrictEqual(result.data, [])
      await client.logout()
    })

    it('should show detailed data to admins', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const expectedSettings = cloneDeep(privateSettings)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: {}
      })

      // Add timestamps to expected settings for comparison
      each(result.data, (setting) => {
        const expectedSetting = find(expectedSettings, { id: setting.id })

        if (!expectedSetting) {
          assert.fail('Unexpected setting returned: ' + setting.id)
        }

        expectedSetting!['created_at'] = setting.created_at
        expectedSetting!['updated_at'] = setting.updated_at
        expectedSetting!['editor_name'] = editorName
      })

      assert.deepStrictEqual(result.data, expectedSettings)
      await client.logout()
    })

    it('should show detailed data to admins for banner_on', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const expected = cloneDeep(find(privateSettings, { id: 'banner_on' }))

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_on' } }
      })

      expected!['created_at'] = result.data[0].created_at
      expected!['updated_at'] = result.data[0].updated_at
      expected!['editor_name'] = editorName

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should show detailed data to admins for banner_text', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const expected = cloneDeep(find(privateSettings, { id: 'banner_text' }))

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'banner_text' } }
      })

      expected!['created_at'] = result.data[0].created_at
      expected!['updated_at'] = result.data[0].updated_at
      expected!['editor_name'] = editorName

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should show detailed data to admins for restrict_login', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const expected = cloneDeep(find(privateSettings, { id: 'restrict_login' }))

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'restrict_login' } }
      })

      expected!['created_at'] = result.data[0].created_at
      expected!['updated_at'] = result.data[0].updated_at
      expected!['editor_name'] = editorName

      assert.deepStrictEqual(result.data, [expected])
      await client.logout()
    })

    it('should show detailed data to admins for loggedout_time', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const expected = cloneDeep(find(privateSettings, { id: 'loggedout_time' }))

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: 'loggedout_time' } }
      })

      expected!['created_at'] = result.data[0].created_at
      expected!['updated_at'] = result.data[0].updated_at
      expected!['editor_name'] = editorName

      assert.deepStrictEqual(result.data, [expected])

      await client.logout()
    })

    it('should return user counts to admin', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: {}
      })

      assert.deepStrictEqual(result.totalUsersOnline, 0, `Expected totalUsersOnline to be 0 but got ${result.totalUsersOnline}`)
      assert.deepStrictEqual(result.totalAuthenticatedUsers, 0, `Expected totalAuthenticatedUsers to be 0 but got ${result.totalAuthenticatedUsers}`)
      await client.logout()
    })

    // TODO: Add test for total authenticated users when users are logged in and a test for anonymous online users
    //   I've tried to add these tests but have had trouble getting them to work reliably in the test environment
    //   server.channel('authenticated').join({}) does not seem to work as expected when calling the api via the client
  })

  describe('get service', () => {
    const method = 'get'

    it('should not be allowed', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_ALLOWED,
        params: { id: 'test' }
      })

      await client.logout()
    })
  })

  describe('patch service', () => {
    const method = 'patch'

    beforeEach(async () => {
      const db = server.get('sequelizeClient')

      Bluebird.each(
        privateSettings,
        async (setting) => {
          await db.query(`
              UPDATE settings
              SET value     = '${setting.value}',
                  editor_id = '${admin.id}'
              WHERE id = '${setting.id}'
          `, { raw: true })
        }
      )
    })

    it('should require authentication', async () => {
      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { id: 'loggedout_time', data: { value: 'new' } }
      })
    })

    it('should be forbidden to participants', async () => {
      await testUserAuthentication('subjectID', participantUser.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { id: 'loggedout_time', data: { value: 'new' } }
      })

      await client.logout()
    })

    it('should be forbidden to coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { id: 'loggedout_time', data: { value: 'new' } }
      })

      await client.logout()
    })

    it('should allow admins to update banner_text', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const value = 'Updated Banner Text'
      const expected = { ...find(privateSettings, { id: 'banner_text' }), value }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: 'banner_text', data: { value } }
      })

      expected!['created_at'] = result.created_at
      expected!['updated_at'] = result.updated_at

      assert.deepStrictEqual(result, expected)
      await client.logout()
    })

    it('should allow admins to update banner_on', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const value = 'true'
      const expected = { ...find(privateSettings, { id: 'banner_on' }), value }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: 'banner_on', data: { value } }
      })

      expected!['created_at'] = result.created_at
      expected!['updated_at'] = result.updated_at

      assert.deepStrictEqual(result, expected)
      await client.logout()
    })

    it('should allow admins to update restrict_login', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const value = 'true'
      const expected = { ...find(privateSettings, { id: 'restrict_login' }), value }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: 'restrict_login', data: { value } }
      })

      expected!['created_at'] = result.created_at
      expected!['updated_at'] = result.updated_at

      assert.deepStrictEqual(result, expected)
      await client.logout()
    })

    it('should allow admins to update loggedout_time', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const value = new Date().toISOString()
      const expected = { ...find(privateSettings, { id: 'loggedout_time' }), value }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: 'loggedout_time', data: { value } }
      })

      expected!['created_at'] = result.created_at
      expected!['updated_at'] = result.updated_at

      assert.deepStrictEqual(result, expected)
      await client.logout()
    })

    it('should set editor id as authed user', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const value = new Date().toISOString()
      const editor_id = admin2.id
      const expected = { ...find(privateSettings, { id: 'loggedout_time' }), value, editor_id: admin.id }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: 'loggedout_time', data: { value, editor_id } }
      })

      expected!['created_at'] = result.created_at
      expected!['updated_at'] = result.updated_at

      assert.deepStrictEqual(result, expected)
      await client.logout()
    })
  })

  describe('create service', () => {
    const method = 'create'

    it('should not be allowed', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_ALLOWED,
        params: { data: { value: 'New Title' } },
      })

      await client.logout()
    })
  })

  describe('update service', () => {
    const method = 'update'

    it('should not be allowed', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_ALLOWED,
        params: { id: 'banner_on', data: { value: 'test' } },
      })

      await client.logout()
    })
  })

  describe('remove service', () => {
    const method = 'remove'

    it('should not be allowed', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_ALLOWED,
        params: { id: 'banner_on' },
      })

      await client.logout()
    })
  })
})
