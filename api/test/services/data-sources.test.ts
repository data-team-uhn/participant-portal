import assert from 'assert'
import { map } from 'lodash'

import resetDb from '../../scripts/db/reset'
import client from '../client'
import { createStudy, createAdmin, createCoordinator, createParticipant, createDataSource } from '../factories'
import server from '../server'
import { test, testUserAuthentication, verifyAllUsers, ERROR } from '../utils'

const service = 'data-sources'

const dataSource1 = createDataSource({})
const dataSource2 = createDataSource({})

const admin = createAdmin({})
const coordinatorUser1 = createCoordinator({ data_source_ids: [dataSource1.id] })
const coordinatorUser2 = createCoordinator({ data_source_ids: [dataSource2.id] })
const participantUser = createParticipant({ data_source_ids: [dataSource1.id] })

const study = createStudy({})

describe('\'data-sources\' service', () => {
  it('registered the service', () => {
    const service = server.service('data-sources')

    assert.ok(service, 'Registered the service')
  })

  before(async () => {
    try {
      await resetDb(server)

      const sequelize = server.get('sequelizeClient')
      const transaction = await sequelize.transaction()
      const params = { transaction, sequelize: { transaction } }

      await server.service('data-sources').create(dataSource1)
      await server.service('data-sources').create(dataSource2)
      await server.service('users').create(admin, { transaction, sequelize: { transaction } })
      await server.service('users').create(coordinatorUser1, params)
      await server.service('users').create(coordinatorUser2, params)
      await server.service('users').create(participantUser, params)

      await transaction.commit()

      await verifyAllUsers(server)

      await server.service('studies').create(study)
    } catch (err) {
      console.error(err)
      throw err
    }
  })

  describe('find service', () => {
    const method = 'find'

    it('should require authentication', async () => {
      return test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED
      })
    })

    it('should be forbidden to participants', async () => {
      await testUserAuthentication('subjectID', participantUser.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN
      })

      await client.logout()
    })

    it('should return limited data sources to coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass'
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.data[0].id, dataSource1.id)
      assert.strictEqual(result.data[0].name, dataSource1.name)

      await client.logout()
    })

    it('should return empty list if coordinator queries a data source they are not approved for', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: dataSource2.id } }
      })

      assert.strictEqual(result.data.length, 0)
      await client.logout()
    })

    it('should return all data sources to admins', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass'
      })

      const names = map(result.data, 'name')
      const ids = map(result.data, 'id')
      assert.strictEqual(result.data.length, 2)
      assert.ok(names.includes(dataSource1.name))
      assert.ok(names.includes(dataSource2.name))
      assert.ok(ids.includes(dataSource1.id))
      assert.ok(ids.includes(dataSource2.id))

      await client.logout()
    })

    it('should return data sources that match query to admins', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { id: dataSource2.id } }
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.data[0].id, dataSource2.id)
      assert.strictEqual(result.data[0].name, dataSource2.name)

      await client.logout()
    })
  })

  describe('get service', () => {
    const method = 'get'

    it('should require authentication', async () => {
      return test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { id: dataSource1.id }
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
        params: { id: dataSource1.id }
      })

      await client.logout()
    })

    it('should return data source if coordinators is approved for it', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: dataSource1.id }
      })

      assert.strictEqual(result.id, dataSource1.id)
      assert.strictEqual(result.name, dataSource1.name)

      await client.logout()
    })

    it('should return not found if coordinator requests a data source they are not approved for', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_FOUND,
        params: { id: dataSource2.id }
      })

      await client.logout()
    })

    it('should return all data sources to admins', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result1 = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: dataSource1.id }
      })

      const result2 = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: dataSource2.id }
      })

      assert.strictEqual(result1.id, dataSource1.id)
      assert.strictEqual(result1.name, dataSource1.name)
      assert.strictEqual(result2.id, dataSource2.id)
      assert.strictEqual(result2.name, dataSource2.name)

      await client.logout()
    })
  })

  describe('patch service', () => {
    const method = 'patch'

    it('should require authentication', async () => {
      return test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { id: 'test' }
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
        params: { id: 'test' }
      })

      await client.logout()
    })

    it('should be forbidden to coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { id: 'test' }
      })

      await client.logout()
    })

    // When this test was written, there weren't any patchable fields
    it('should allow admins to patch patchable fields', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const data = { name: 'new name' }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: dataSource1.id, data }
      })

      // No change, name is not patchable
      assert.strictEqual(result.id, dataSource1.id)
      assert.strictEqual(result.name, dataSource1.name)
      await client.logout()
    })
  })

  describe('create service', () => {
    const method = 'create'

    it('should require authentication', async () => {
      return test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { data: { name: 'test1' } }
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
        params: { data: { name: 'test1' } }
      })

      await client.logout()
    })

    it('should be forbidden to coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { data: { name: 'test1' } }
      })

      await client.logout()
    })

    it('should allow admins to create new data sources', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const data = { name: 'new test data source' }

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { data }
      })

      assert.strictEqual(result.name, data.name)
      await client.logout()
    })

    it('should throw bad request if creating without a name', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.BAD_REQUEST,
        params: { data: {} }
      })

      await client.logout()
    })
  })

  describe('update service', () => {
    const method = 'update'

    it('should not allow updating', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        params: { id: 'test' },
        errorCode: ERROR.NOT_ALLOWED
      })

      await client.logout()
    })
  })

  describe('remove service', () => {
    const method = 'remove'

    it('should not allow remove', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        params: { id: 'test' },
        errorCode: ERROR.NOT_ALLOWED
      })

      await client.logout()
    })
  })
})
