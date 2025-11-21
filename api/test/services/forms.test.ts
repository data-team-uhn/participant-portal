/**
 * Overview of forms service requirements:
 *
 * - Only authenticated users can access the service.
 * - Admins can create, view, and edit all forms.
 * - Coordinators can create, view, and edit forms for studies they are assigned to.
 * - Participants can view forms for studies they are enrolled in but cannot create or edit forms.
 * - Updating forms is not allowed for any user role.
 * - Deleting forms is not allowed for any user role.
 * - The 'name' of the form must be unique within the same study.
 * - Patch and Create operations must validate user permissions based on their role and study associations.
 * - Get and Find operations must filter results based on user permissions.
 */

import { faker } from '@faker-js/faker'
import assert from 'assert'
import { map, includes, each } from 'lodash'

import resetDb from '../../scripts/db/reset'
import client from '../client'
import { createForm, createStudy, createAdmin, createCoordinator, createParticipant, createDataSource } from '../factories'
import server from '../server'
import { test, testUserAuthentication, verifyAllUsers, ERROR } from '../utils'

const service = 'forms'

const dataSource = createDataSource({})

const admin = createAdmin({})

const coordinatorUser1 = createCoordinator({ data_source_ids: [dataSource.id] })
const coordinatorUser2 = createCoordinator({ data_source_ids: [dataSource.id] })

const participantUser1 = createParticipant({ data_source_ids: [dataSource.id] })
const participantUser2 = createParticipant({ data_source_ids: [dataSource.id] })

const study1 = createStudy({})
const study2 = createStudy({})

const form1 = createForm(study1.id, coordinatorUser1.id)
const form2 = createForm(study2.id, coordinatorUser2.id)

describe('\'forms\' service', () => {
  it('registered the service', () => {
    const service = server.service('forms')

    assert.ok(service, 'Registered the service')
  })

  // Create forms and associations for `find` tests
  before(async() => {
    try {
      await resetDb(server)

      const sequelize = server.get('sequelizeClient')
      const transaction = await sequelize.transaction()
      const params = { transaction, sequelize: { transaction } }

      await server.service('data-sources').create(dataSource)
      await server.service('users').create(admin, { transaction, sequelize: { transaction } })
      const { coordinator: coordinator1 } = await server.service('users').create(coordinatorUser1, params)
      const { coordinator: coordinator2 } = await server.service('users').create(coordinatorUser2, params)
      const { participant: participant1 } = await server.service('users').create(participantUser1, params)
      const { participant: participant2 } = await server.service('users').create(participantUser2, params)

      await transaction.commit()

      await verifyAllUsers(server)

      await server.service('studies').create(study1)
      await server.service('studies').create(study2)
      await server.service('forms').create(form1)
      await server.service('forms').create(form2)

      await server.service('study-coordinators').create({ study_id: study1.id, member_id: coordinator1.id })
      await server.service('study-coordinators').create({ study_id: study2.id, member_id: coordinator2.id })

      await server.service('study-participants').create({ study_id: study1.id, member_id: participant1.id })
      await server.service('study-participants').create({ study_id: study2.id, member_id: participant2.id })
    } catch (err) {
      console.error(err)
      throw err
    }
  })

  describe('find service', () => {

    it('should require authentication', async() => {
      await test({
        client,
        service,
        method: 'find',
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED
      })
    })

    it('should let admins view all forms', async() => {
      await testUserAuthentication('subjectID', admin.id)

      const result = await test({
        client,
        service,
        method: 'find',
        outcome: 'pass'
      })

      const resultIds = map(result.data, 'id')
      const expectedIds = [form1.id, form2.id]

      assert.strictEqual(result.total, 2, `Expected 2 results, but got ${result.total}`)
      each(expectedIds, (id) => {
        assert.ok(includes(resultIds, id), `Expected form id ${id} in results`)
      })

      await client.logout()
    })

    it('should let coordinators view forms they have permission for', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method: 'find',
        outcome: 'pass'
      })

      assert.strictEqual(result.total, 1, `Expected 1 result, but got ${result.total}`)
      assert.strictEqual(result.data[0].id, form1.id, `Expected form id ${form1.id}, but got ${result.data[0].id}`)

      await client.logout()
    })

    it('should let participants view forms they have permission for', async() => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method: 'find',
        outcome: 'pass'
      })

      assert.strictEqual(result.total, 1, `Expected 1 result, but got ${result.total}`)
      assert.strictEqual(result.data[0].id, form1.id, `Expected form id ${form1.id}, but got ${result.data[0].id}`)

      await client.logout()
    })

    it('should not retrieve forms coordinators don\'t have permission for', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method: 'find',
        outcome: 'pass',
        params: { query: { id: form2.id } }
      })

      assert.strictEqual(result.total, 0, `Expected 0 result, but got ${result.total}`)

      await client.logout()
    })

    it('should not retrieve forms participants don\'t have permission for', async() => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method: 'find',
        outcome: 'pass',
        params: { query: { id: form2.id } }
      })

      assert.strictEqual(result.total, 0, `Expected 0 result, but got ${result.total}`)

      await client.logout()
    })
  })

  describe('get service', () => {

    it('should require authentication', async() => {
      await test({
        client,
        service,
        method: 'get',
        outcome: 'fail',
        params: { id: form1.id },
        errorCode: ERROR.NOT_AUTHENTICATED
      })
    })

    it('should let admins view all forms', async() => {
      await testUserAuthentication('subjectID', admin.id)

      const result1 = await test({
        client,
        service,
        method: 'get',
        outcome: 'pass',
        params: { id: form1.id }
      })

      const result2 = await test({
        client,
        service,
        method: 'get',
        outcome: 'pass',
        params: { id: form2.id }
      })

      assert.strictEqual(result1.id, form1.id, `Expected form id ${form1.id}, but got ${result1.id}`)
      assert.strictEqual(result2.id, form2.id, `Expected form id ${form2.id}, but got ${result2.id}`)

      await client.logout()
    })

    it('should let coordinators view forms they have permission for', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method: 'get',
        outcome: 'pass',
        params: { id: form1.id }
      })

      assert.strictEqual(result.id, form1.id, `Expected form id ${form1.id}, but got ${result.id}`)

      await client.logout()
    })

    it('should let participants view forms they have permission for', async() => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method: 'get',
        outcome: 'pass',
        params: { id: form1.id }
      })

      assert.strictEqual(result.id, form1.id, `Expected form id ${form1.id}, but got ${result.id}`)

      await client.logout()
    })

    it('should not retrieve forms coordinators don\'t have permission for', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method: 'get',
        outcome: 'fail',
        params: { id: form2.id },
        errorCode: ERROR.NOT_FOUND
      })

      await client.logout()
    })

    it('should not retrieve forms participants don\'t have permission for', async() => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await test({
        client,
        service,
        method: 'get',
        outcome: 'fail',
        params: { id: form2.id },
        errorCode: ERROR.NOT_FOUND
      })

      await client.logout()
    })
  })

  describe('patch service', () => {

    it('should require authentication', async() => {
      await test({
        client,
        service,
        method: 'patch',
        outcome: 'fail',
        params: { id: form1.id },
        errorCode: ERROR.NOT_AUTHENTICATED
      })
    })

    it('should allow admin to patch any form', async() => {
      const expectedForm1 = { test: 'test1' }
      const expectedForm2 = { test: 'test2' }

      await testUserAuthentication('subjectID', admin.id)

      const result1 = await test({
        client,
        service,
        method: 'patch',
        outcome: 'pass',
        params: { id: form1.id, data: { name: form1.name, study_id: study1.id, form: expectedForm1 } }
      })

      const result2 = await test({
        client,
        service,
        method: 'patch',
        outcome: 'pass',
        params: { id: form2.id, data: { name: form2.name, study_id: study2.id, form: expectedForm2 } }
      })

      assert.strictEqual(JSON.stringify(result1.form), JSON.stringify(expectedForm1))
      assert.strictEqual(JSON.stringify(result2.form), JSON.stringify(expectedForm2))

      await client.logout()
    })

    it('should allow coordinators to patch forms they have permission for', async () => {
      const expectedForm = { test: 'coordinator test' }

      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method: 'patch',
        outcome: 'pass',
        params: { id: form1.id, data: { name: form1.name, study_id: study1.id, form: expectedForm } }
      })

      assert.strictEqual(JSON.stringify(result.form), JSON.stringify(expectedForm))

      await client.logout()
    })

    it('should prevent coordinators from patching forms they don\'t have permission for', async () => {
      const expectedForm = { test: 'coordinator test' }

      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method: 'patch',
        outcome: 'fail',
        params: { id: form2.id, data: { name: form2.name, study_id: study2.id, form: expectedForm } },
        errorCode: ERROR.FORBIDDEN
      })

      await client.logout()
    })

    it('should fail if name and study together don\'t correspond to a form', async() => {
      const expectedForm = { test: 'coordinator test' }

      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method: 'patch',
        outcome: 'fail',
        params: { id: form1.id, data: { name: form1.name, study_id: study2.id, form: expectedForm } },
        errorCode: ERROR.FORBIDDEN
      })

      await client.logout()
    })

    it('should prevent participants from patching forms', async() => {
      const expectedForm = { test: 'participant test' }

      await testUserAuthentication('subjectID', participantUser1.id)

      await test({
        client,
        service,
        method: 'patch',
        outcome: 'fail',
        params: { id: form1.id, data: { name: form1.name, study_id: study1.id, form: expectedForm } },
        errorCode: ERROR.FORBIDDEN
      })

      await client.logout()
    })
  })

  describe('create service', () => {

    it('should require authentication', async() => {
      await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        params: { data: {} },
        errorCode: ERROR.NOT_AUTHENTICATED
      })
    })

    it('should allow admin to create any form', async() => {
      const expectedForm1 = { test: 'test1' }
      const expectedForm2 = { test: 'test2' }

      await testUserAuthentication('subjectID', admin.id)

      const result1 = await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { name: faker.word.sample(), study_id: study1.id, form: expectedForm1 } }
      })

      const result2 = await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { name: faker.word.sample(), study_id: study2.id, form: expectedForm2 } }
      })

      assert.strictEqual(JSON.stringify(result1.form), JSON.stringify(expectedForm1))
      assert.strictEqual(JSON.stringify(result2.form), JSON.stringify(expectedForm2))

      await client.logout()
    })

    it('should throw an error if the form name is not unique to the study', async() => {
      const expectedForm1 = { test: 'test1' }

      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        params: { data: { name: form1.name, study_id: study1.id, form: expectedForm1 } },
        errorCode: ERROR.BAD_REQUEST
      })

      await client.logout()
    })

    it('should allow coordinators to create forms in studies they have permission for', async () => {
      const expectedForm = { test: 'coordinator test' }

      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { name: faker.word.sample(), study_id: study1.id, form: expectedForm } }
      })

      assert.strictEqual(JSON.stringify(result.form), JSON.stringify(expectedForm))

      await client.logout()
    })

    it('should prevent coordinators from creating forms in studies they don\'t have permission for', async () => {
      const expectedForm = { test: 'coordinator test' }

      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        params: { data: { name: faker.word.sample(), study_id: study2.id, form: expectedForm } },
        errorCode: ERROR.FORBIDDEN
      })

      await client.logout()
    })

    it('should prevent participants from creating forms', async() => {
      const expectedForm = { test: 'participant test' }

      await testUserAuthentication('subjectID', participantUser1.id)

      await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        params: { data: { name: faker.word.sample(), study_id: study1.id, form: expectedForm } },
        errorCode: ERROR.FORBIDDEN
      })

      await client.logout()
    })
  })

  describe('update service', () => {
    it('should not allow updating forms', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method: 'update',
        outcome: 'fail',
        params: { id: form1.id },
        errorCode: ERROR.NOT_ALLOWED
      })

      await client.logout()
    })
  })

  describe('delete service', () => {
    it('should not allow deleting forms', async() => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method: 'remove',
        outcome: 'fail',
        params: { id: form1.id },
        errorCode: ERROR.NOT_ALLOWED
      })

      await client.logout()
    })
  })
})
