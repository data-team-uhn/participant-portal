/**
 * Overview of studies service requirements:
 *
 * - Unauthenticated users can only see the title and description of studies.
 * - Participants can see full study details only for studies they are enrolled in.
 * - Coordinators can see full study details only for studies they manage.
 * - Admins can see and modify all study details.
 * - Coordinators can only update the linkId of studies they manage.
 * - Admins can create and update most fields of studies.
 * - The registry study (identified by REGISTRY_EXTERNAL_ID) should always be listed first.
 */

import assert from 'assert'
import { keys } from 'lodash'

import resetDb from '../../scripts/db/reset'
import client from '../client'
import { createStudy, createAdmin, createCoordinator, createParticipant, createDataSource } from '../factories'
import server from '../server'
import { test, testUserAuthentication, verifyAllUsers, ERROR } from '../utils'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

const service = 'studies'

const dataSource = createDataSource({})

const admin = createAdmin({})

const coordinatorUser1 = createCoordinator({ data_source_ids: [dataSource.id] })
const coordinatorUser2 = createCoordinator({ data_source_ids: [dataSource.id] })

const participantUser1 = createParticipant({ data_source_ids: [dataSource.id] })
const participantUser2 = createParticipant({ data_source_ids: [dataSource.id] })

const study1 = createStudy({})
const study2 = createStudy({ external_study_id: REGISTRY_EXTERNAL_ID })

describe('\'studies\' service', () => {
  it('registered the service', () => {
    const service = server.service('studies')

    assert.ok(service, 'Registered the service')
  })

  before(async () => {
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

      await server.service('study-coordinators').create({ study_id: study1.id, member_id: coordinator1.id })
      await server.service('study-coordinators').create({ study_id: study2.id, member_id: coordinator2.id })

      await server.service('study-participants').create({ study_id: study1.id, member_id: participant1.id })
      await server.service('study-participants').create({ study_id: study2.id, member_id: participant2.id })
    } catch (err) {
      console.error(err)
      throw err
    }
  })

  // Reset any study data that may have been changed during tests
  beforeEach(async () => {
    const db = server.get('sequelizeClient')

    await db.query(`
        UPDATE studies
        SET link_id     = '${study1.linkId}',
            title       = '${study1.title}',
            description = '${study1.description}',
            stage       = '${study1.stage}',
            phase       = '${study1.phase}',
            type        = '${study1.type}'
        WHERE id = '${study1.id}'
    `, { raw: true })

    await db.query(`
        UPDATE studies
        SET link_id     = '${study2.linkId}',
            title       = '${study2.title}',
            description = '${study2.description}',
            stage       = '${study2.stage}',
            phase       = '${study2.phase}',
            type        = '${study2.type}'
        WHERE id = '${study2.id}'
    `, { raw: true })
  })

  describe('find service', () => {
    const method = 'find'

    it.skip('should only show title and description if user is not authed', async () => {
      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { external_study_id: study1.external_study_id } }
      })

      assert.strictEqual(result.total, 1, `Expected to find 1 study but found ${result.total}`)
      assert.deepStrictEqual(keys(result.data[0]), ['title', 'description', 'id'], `Expected only title, description, id but found ${keys(result.data[0])}`)
      assert.strictEqual(result.data[0].id, study1.id)
      assert.strictEqual(result.data[0].title, study1.title)
      assert.strictEqual(result.data[0].description, study1.description)
    })

    it('should require participant authentication to see full study', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { external_study_id: study1.external_study_id } }
      })

      assert.strictEqual(result.total, 1, `Expected to find 1 study but found ${result.total}`)
      assert.strictEqual(result.data[0].id, study1.id)
      assert.strictEqual(result.data[0].title, study1.title)
      assert.strictEqual(result.data[0].description, study1.description)
      assert.strictEqual(result.data[0].external_study_id, study1.external_study_id)
      assert.strictEqual(result.data[0].stage, study1.stage)
      assert.strictEqual(result.data[0].phase, study1.phase)
      assert.strictEqual(result.data[0].type, study1.type)
      assert.strictEqual(result.data[0].linkId, study1.linkId)

      await client.logout()
    })

    it('should require coordinator authentication to see full study', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { external_study_id: study1.external_study_id } }
      })

      assert.strictEqual(result.total, 1, `Expected to find 1 study but found ${result.total}`)
      assert.strictEqual(result.data[0].id, study1.id)
      assert.strictEqual(result.data[0].title, study1.title)
      assert.strictEqual(result.data[0].description, study1.description)
      assert.strictEqual(result.data[0].external_study_id, study1.external_study_id)
      assert.strictEqual(result.data[0].stage, study1.stage)
      assert.strictEqual(result.data[0].phase, study1.phase)
      assert.strictEqual(result.data[0].type, study1.type)
      assert.strictEqual(result.data[0].linkId, study1.linkId)

      await client.logout()
    })

    it('should filter studies by participant membership', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { external_study_id: study2.external_study_id } }
      })

      assert.strictEqual(result.total, 0, `Expected to find 0 studies but found ${result.total}`)
      await client.logout()
    })

    it('should filter studies by coordinator membership', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { external_study_id: study2.external_study_id } }
      })

      assert.strictEqual(result.total, 0, `Expected to find 0 studies but found ${result.total}`)
      await client.logout()
    })

    it('should allow admins to view all studies', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
      })

      assert.strictEqual(result.total, 2, `Expected to find 2 studies but found ${result.total}`)
      await client.logout()
    })

    it('should list registry study first', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
      })

      assert.strictEqual(result.data[0].external_study_id, REGISTRY_EXTERNAL_ID, `Expected first study to be registry study but found ${result.data[0].external_study_id}`)
      await client.logout()
    })
  })

  describe('get service', () => {
    const method = 'get'

    it('should require participant authentication to see full study', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study1.id }
      })

      assert.strictEqual(result.id, study1.id)
      assert.strictEqual(result.title, study1.title)
      assert.strictEqual(result.description, study1.description)
      assert.strictEqual(result.external_study_id, study1.external_study_id)
      assert.strictEqual(result.stage, study1.stage)
      assert.strictEqual(result.phase, study1.phase)
      assert.strictEqual(result.type, study1.type)
      assert.strictEqual(result.linkId, study1.linkId)

      await client.logout()
    })

    it('should require coordinator authentication to see full study', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study1.id }
      })

      assert.strictEqual(result.id, study1.id)
      assert.strictEqual(result.title, study1.title)
      assert.strictEqual(result.description, study1.description)
      assert.strictEqual(result.external_study_id, study1.external_study_id)
      assert.strictEqual(result.stage, study1.stage)
      assert.strictEqual(result.phase, study1.phase)
      assert.strictEqual(result.type, study1.type)
      assert.strictEqual(result.linkId, study1.linkId)

      await client.logout()
    })

    it('should filter studies by participant membership', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_FOUND,
        params: { id: study2.id }
      })

      await client.logout()
    })

    it('should filter studies by coordinator membership', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_FOUND,
        params: { id: study2.id }
      })

      await client.logout()
    })

    it('should allow admins to view all studies', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const result1 = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study1.id }
      })

      const result2 = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study2.id }
      })

      assert.strictEqual(result1.title, study1.title)
      assert.strictEqual(result2.title, study2.title)
      await client.logout()
    })
  })

  describe('patch service', () => {
    const method = 'patch'

    it('should not be supported for participants', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { id: study1.id, data: { title: 'New Title' } },
      })

      await client.logout()
    })

    it('should allow coordinators to update linkId', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)
      const newLinkId = 'newLinkId123'

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study1.id, data: { linkId: newLinkId } },
      })

      assert.strictEqual(result.linkId, newLinkId)
      await client.logout()
    })

    it('should not allow coordinators to update title, description, etc', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study1.id, data: { ...createStudy(), linkId: study1.linkId } },
      })

      assert.strictEqual(result.linkId, study1.linkId)
      assert.strictEqual(result.title, study1.title)
      assert.strictEqual(result.description, study1.description)
      assert.strictEqual(result.external_study_id, study1.external_study_id)
      assert.strictEqual(result.stage, study1.stage)
      assert.strictEqual(result.phase, study1.phase)
      assert.strictEqual(result.type, study1.type)
      await client.logout()
    })

    it('should not allow coordinators update studies they don\'t belong to', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_FOUND,
        params: { id: study2.id, data: { ...createStudy() } },
      })

      await client.logout()
    })

    it('should allow admins to update most fields', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const newStudyData = createStudy()

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: study1.id, data: newStudyData },
      })

      // Not updated
      assert.strictEqual(result.id, study1.id)
      assert.strictEqual(result.external_study_id, study1.external_study_id)

      // Updated
      assert.strictEqual(result.title, newStudyData.title)
      assert.strictEqual(result.description, newStudyData.description)
      assert.strictEqual(result.stage, newStudyData.stage)
      assert.strictEqual(result.phase, newStudyData.phase)
      assert.strictEqual(result.type, newStudyData.type)
      assert.strictEqual(result.linkId, newStudyData.linkId)

      await client.logout()
    })
  })

  describe('create service', () => {
    const method = 'create'

    it('should not be supported for participants', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { data: { title: 'New Title' } },
      })

      await client.logout()
    })

    it('should not be supported for coordinators', async () => {
      await testUserAuthentication('subjectID', coordinatorUser1.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { data: { title: 'New Title' } },
      })

      await client.logout()
    })

    it('should allow admins to create', async () => {
      await testUserAuthentication('subjectID', admin.id)
      const newStudyData = createStudy()

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { data: newStudyData },
      })

      assert.strictEqual(result.id, newStudyData.id)
      assert.strictEqual(result.external_study_id, newStudyData.external_study_id)
      assert.strictEqual(result.title, newStudyData.title)
      assert.strictEqual(result.description, newStudyData.description)
      assert.strictEqual(result.stage, newStudyData.stage)
      assert.strictEqual(result.phase, newStudyData.phase)
      assert.strictEqual(result.type, newStudyData.type)
      assert.strictEqual(result.linkId, newStudyData.linkId)

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
        params: { id: study1.id, data: { title: 'New Title' } },
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
        params: { id: study1.id },
      })

      await client.logout()
    })
  })
})
