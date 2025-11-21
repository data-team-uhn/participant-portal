/**
 * Overview of module-responses service requirements:
 *
 * - The service should be registered.
 * - Only authenticated participants can access the service.
 * - Participants can only see their own responses.
 * - Only completed responses are returned.
 * - Admin users can view responses for any participant.
 * - Coordinators are forbidden from accessing this service.
 */

import assert from 'assert'
import { sortBy } from 'lodash'
import { InferCreationAttributes } from 'sequelize'

import resetDb from '../../scripts/db/reset'
import { FormResponsesModel, FormsModel } from '../../src/models/declarations'
import { FormsTypeEnum } from '../../src/models/formsType.enum'
import client from '../client'
import { createAdmin, createCoordinator, createDataSource, createForm, createFormResponse, createParticipant, createStudy } from '../factories'
import server from '../server'
import { ERROR, test, testUserAuthentication, verifyAllUsers } from '../utils'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

const service = 'module-responses'

const dataSource = createDataSource({})

const admin = createAdmin({})

const coordinatorUser = createCoordinator({ data_source_ids: [dataSource.id] })

const participantUser1 = createParticipant({ data_source_ids: [dataSource.id] })
const participantUser2 = createParticipant({ data_source_ids: [dataSource.id] })
let participant1
let participant2

const study = createStudy({ external_study_id: REGISTRY_EXTERNAL_ID })
const otherStudy = createStudy({})

const consent = createForm(study.id, coordinatorUser.id, { type: FormsTypeEnum.CONSENT })
const module1 = createForm(study.id, coordinatorUser.id)
const module2 = createForm(study.id, coordinatorUser.id)
const otherConsent = createForm(otherStudy.id, coordinatorUser.id, { type: FormsTypeEnum.CONSENT })

const respondToForm = async (formId: string, participantId: string, is_complete = true, responses = {}): Promise<FormResponsesModel> => {
  return await server.service('form-responses').create(createFormResponse(formId, { participant_id: participantId, is_complete, responses }))
}

const createNewFormVersion = async (form: InferCreationAttributes<FormsModel> & { id: string }, newForm = {}): Promise<FormsModel> => {
  return await server.service('forms').create({
    name: form.name,
    study_id: study.id,
    type: form.type,
    version: form.version + 1,
    form: newForm
  })
}

describe('\'module-responses\' service', () => {
  it('registered the service', () => {
    const service = server.service('module-responses')

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
      const { coordinator: coordinator } = await server.service('users').create(coordinatorUser, params)
      const participantResult1 = await server.service('users').create(participantUser1, params)
      const participantResult2 = await server.service('users').create(participantUser2, params)
      participant1 = participantResult1.participant
      participant2 = participantResult2.participant

      await transaction.commit()

      await verifyAllUsers(server)

      await server.service('studies').create(study)
      await server.service('studies').create(otherStudy)

      await server.service('forms').create(consent)
      await server.service('forms').create(module1)
      await server.service('forms').create(module2)
      await server.service('forms').create(otherConsent)

      await server.service('study-coordinators').create({ study_id: study.id, member_id: coordinator.id })
      await server.service('study-coordinators').create({ study_id: otherStudy.id, member_id: coordinator.id })

      await server.service('study-participants').create({ study_id: study.id, member_id: participant1.id })
      await server.service('study-participants').create({ study_id: otherStudy.id, member_id: participant1.id })
      await server.service('study-participants').create({ study_id: study.id, member_id: participant2.id })
    } catch (err) {
      console.error(err)
      throw err
    }
  })

  // Clean up form responses before each test
  beforeEach(async () => {
    const db = server.get('sequelizeClient')

    await db.query(`
        DELETE
        FROM form_responses
    `, { raw: true })
  })

  describe('find service', () => {
    const method = 'find'

    it('should require participant authentication to see responses', async () => {
      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { query: { participant_id: participant1!.id } },
      })

      await client.logout()
    })

    it('should return an empty list if there are no responses', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      assert.strictEqual(result.total, 0)
      assert.strictEqual(result.data.length, 0)
      await client.logout()
    })

    it('should return an empty list if consent is incomplete', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const responseData = { q1: 'answer1' }
      await respondToForm(consent.id, participant1!.id, false, responseData)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      assert.strictEqual(result.total, 0)
      assert.strictEqual(result.data.length, 0)
      await client.logout()
    })

    it('should return consent if consent has a response', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const responseData = { q1: 'answer1' }
      const response = await respondToForm(consent.id, participant1!.id, true, responseData)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      assert.strictEqual(result.total, 1)
      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.data[0].id, consent.id)
      assert.strictEqual(result.data[0].name, consent.name)
      assert.strictEqual(result.data[0].type, consent.type)
      assert.strictEqual(result.data[0].study_id, study.id)
      assert.strictEqual(result.data[0].created_by, coordinatorUser.id)
      assert.strictEqual(result.data[0].version, consent.version)
      assert.deepStrictEqual(result.data[0].form, consent.form)
      assert.strictEqual(result.data[0].form_responses.id, response.id)
      assert.strictEqual(result.data[0].form_responses.form_id, consent.id)
      assert.strictEqual(result.data[0].form_responses.participant_id, participant1!.id)
      assert.strictEqual(result.data[0].form_responses.is_complete, true)
      assert.deepStrictEqual(result.data[0].form_responses.responses, responseData)
      assert.strictEqual(result.data[0].form_responses.furthest_page, response.furthest_page)
      assert.strictEqual(result.data[0].form_responses.last_updated_at, response.last_updated_at.toISOString())
      await client.logout()
    })

    it('should not return incomplete modules', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      await respondToForm(module1.id, participant1!.id, false, { q2: 'answer2' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      assert.strictEqual(result.total, 1)
      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.data[0].id, consent.id)
      await client.logout()
    })

    it('should return complete modules with complete consents', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const modules = sortBy([module1, module2], 'name')
      const module1Data = { q2: 'answer2' }
      const module2Data = { q3: 'answer3' }
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      await respondToForm(modules[0].id, participant1!.id, true, module1Data)
      await respondToForm(modules[1].id, participant1!.id, true, module2Data)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      assert.strictEqual(result.total, 3)
      assert.strictEqual(result.data.length, 3)
      assert.strictEqual(result.data[0].id, consent.id)
      assert.strictEqual(result.data[1].id, modules[0].id)
      assert.deepStrictEqual(result.data[1].form_responses.responses, module1Data)
      assert.strictEqual(result.data[2].id, modules[1].id)
      assert.deepStrictEqual(result.data[2].form_responses.responses, module2Data)
      await client.logout()
    })

    it('should return all response versions', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const form1Response = { q1: 'answer1' }
      const form2Response = { q2: 'new answer2' }

      await respondToForm(consent.id, participant1!.id, true, form1Response)
      const updatedConsent = await createNewFormVersion(consent, { new_field: 'new' })
      await respondToForm(updatedConsent.id as unknown as string, participant1!.id, true, form2Response)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      assert.strictEqual(result.total, 2)
      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.data[0].id, consent.id)
      assert.strictEqual(result.data[0].version, 1)
      assert.deepStrictEqual(result.data[0].form_responses.responses, form1Response)
      assert.strictEqual(result.data[1].id, updatedConsent.id)
      assert.strictEqual(result.data[1].version, 2)
      assert.deepStrictEqual(result.data[1].form_responses.responses, form2Response)
      await client.logout()
    })

    it('should return forms specific to a participant', async () => {
      await testUserAuthentication('subjectID', participantUser2.id)

      // Participant 1 completes all forms, participant 2 doesn't complete any
      // Participant 2 shouldn't see any responses
      const modules = sortBy([module1, module2], 'name')
      const module1Data = { q2: 'answer2' }
      const module2Data = { q3: 'answer3' }
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      await respondToForm(modules[0].id, participant1!.id, true, module1Data)
      await respondToForm(modules[1].id, participant1!.id, true, module2Data)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant2!.id } },
      })

      assert.strictEqual(result.total, 0)
      assert.strictEqual(result.data.length, 0)
      await client.logout()
    })


    it('should set participant id to authenticated participant', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      // Participant 1 completes all forms, participant 2 doesn't complete any
      // Query below is for participant 2
      // API should update query to participant 1
      const modules = sortBy([module1, module2], 'name')
      const module1Data = { q2: 'answer2' }
      const module2Data = { q3: 'answer3' }
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      await respondToForm(modules[0].id, participant1!.id, true, module1Data)
      await respondToForm(modules[1].id, participant1!.id, true, module2Data)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant2!.id } },
      })

      assert.strictEqual(result.total, 3)
      assert.strictEqual(result.data.length, 3)
      assert.strictEqual(result.data[0].id, consent.id)
      assert.strictEqual(result.data[1].id, modules[0].id)
      assert.deepStrictEqual(result.data[1].form_responses.responses, module1Data)
      assert.strictEqual(result.data[2].id, modules[1].id)
      assert.deepStrictEqual(result.data[2].form_responses.responses, module2Data)
      await client.logout()
    })

    it('should allow admins to view any participant', async () => {
      await testUserAuthentication('subjectID', admin.id)

      const participant1Response = { q1: 'answer1' }
      const participant2Response = { q1: 'answer2' }
      await respondToForm(consent.id, participant1!.id, true, participant1Response)
      await respondToForm(consent.id, participant2!.id, true, participant2Response)

      const participant1Result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant1!.id } },
      })

      const participant2Result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant2!.id } },
      })

      assert.strictEqual(participant1Result.total, 1)
      assert.strictEqual(participant1Result.data.length, 1)
      assert.deepStrictEqual(participant1Result.data[0].form_responses.responses, participant1Response)

      assert.strictEqual(participant2Result.total, 1)
      assert.strictEqual(participant2Result.data.length, 1)
      assert.deepStrictEqual(participant2Result.data[0].form_responses.responses, participant2Response)
      await client.logout()
    })

    it('should not return responses for forms in other studies', async () => {
      await testUserAuthentication('subjectID', participantUser2.id)

      await respondToForm(otherConsent.id, participant2!.id, true, { q1: 'answer1' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { query: { participant_id: participant2!.id } },
      })

      assert.strictEqual(result.total, 0)
      assert.strictEqual(result.data.length, 0)
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
        params: { query: { participant_id: participant1!.id } },
      })

      await client.logout()
    })
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
        params: { id: participant1!.id, query: { participant_id: participant1!.id } },
      })

      await client.logout()
    })

  })

  describe('patch service', () => {
    const method = 'patch'

    it('should not be allowed', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_ALLOWED,
        params: { query: { participant_id: participant1!.id }, data: { title: 'New Title' } },
      })

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
        params: { data: { title: 'New Title' } },
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
        params: { id: study.id, data: { title: 'New Title' } },
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
        params: { id: study.id },
      })

      await client.logout()
    })
  })
})
