/**
 * Overview of modules service requirements:
 *
 * - Participants are only shown consents and modules associated with the registry study
 * - Participants can only see results if they are enrolled in the registry study
 * - Participants can only see modules if they have completed the consent form
 * - Participants can only see modules they have not yet completed
 * - Participants should see their partial responses to incomplete modules
 * - Admins can see all modules for any participant
 * - Coordinators cannot access this service
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

const service = 'modules'

const dataSource = createDataSource({})

const admin = createAdmin({})

const coordinatorUser = createCoordinator({ data_source_ids: [dataSource.id] })

const participantUser1 = createParticipant({ data_source_ids: [dataSource.id] })
const participantUser2 = createParticipant({ data_source_ids: [dataSource.id] })
const participantUser3 = createParticipant({ data_source_ids: [dataSource.id] })
let participant1
let participant2
let participant3

const study = createStudy({ external_study_id: REGISTRY_EXTERNAL_ID })
const otherStudy = createStudy({})

const consent = createForm(study.id, coordinatorUser.id, { type: FormsTypeEnum.CONSENT })
const module1 = createForm(study.id, coordinatorUser.id)
const module2 = createForm(study.id, coordinatorUser.id)
const otherConsent = createForm(otherStudy.id, coordinatorUser.id, { type: FormsTypeEnum.CONSENT })
const otherModule = createForm(otherStudy.id, coordinatorUser.id)

const respondToForm = async (formId: string, participantId: string, is_complete = true, responses = {}): Promise<FormResponsesModel> => {
  return await server.service('form-responses').create(createFormResponse(formId, { participant_id: participantId, is_complete, responses }))
}

const createNewFormVersion = async (form: InferCreationAttributes<FormsModel> & { id: string }, newForm = {}): Promise<FormsModel> => {
  return await server.service('forms').patch(form.id, { name: form.name, study_id: study.id, form: newForm })
}

describe('\'modules\' service', () => {
  it('registered the service', () => {
    const service = server.service('modules')

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
      const participantResult3 = await server.service('users').create(participantUser3, params)
      participant1 = participantResult1.participant
      participant2 = participantResult2.participant
      participant3 = participantResult3.participant

      await transaction.commit()

      await verifyAllUsers(server)

      await server.service('studies').create(study)
      await server.service('studies').create(otherStudy)

      await server.service('forms').create(consent)
      await server.service('forms').create(module1)
      await server.service('forms').create(module2)
      await server.service('forms').create(otherConsent)
      await server.service('forms').create(otherModule)

      await server.service('study-coordinators').create({ study_id: study.id, member_id: coordinator.id })
      await server.service('study-coordinators').create({ study_id: otherStudy.id, member_id: coordinator.id })

      await server.service('study-participants').create({ study_id: study.id, member_id: participant1.id })
      await server.service('study-participants').create({ study_id: otherStudy.id, member_id: participant1.id })
      await server.service('study-participants').create({ study_id: study.id, member_id: participant2.id })
      await server.service('study-participants').create({ study_id: otherStudy.id, member_id: participant3.id })
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

    it('should not be allowed', async () => {
      await testUserAuthentication('subjectID', admin.id)

      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_ALLOWED,
        params: { params: { title: 'New Title' } },
      })

      await client.logout()
    })
  })

  describe('get service', () => {
    const method = 'get'

    it('should require participant authentication to see modules', async () => {
      await test({
        client,
        service,
        method,
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { id: participant1!.id },
      })

      await client.logout()
    })

    it('should only show consents when consent is incomplete', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.type, FormsTypeEnum.CONSENT)
      assert.strictEqual(result.data[0].id, consent.id)
      assert.strictEqual(result.data[0].name, consent.name)
      assert.strictEqual(result.data[0].type, consent.type)
      assert.strictEqual(result.data[0].study_id, study.id)
      assert.strictEqual(result.data[0].created_by, coordinatorUser.id)
      assert.strictEqual(result.data[0].version, consent.version)
      assert.deepStrictEqual(result.data[0].form, consent.form)
      assert.strictEqual(result.data[0].form_responses.id, null)
      assert.strictEqual(result.data[0].form_responses.form_id, null)
      assert.strictEqual(result.data[0].form_responses.participant_id, null)
      assert.strictEqual(result.data[0].form_responses.is_complete, null)
      assert.strictEqual(result.data[0].form_responses.responses, null)
      assert.strictEqual(result.data[0].form_responses.furthest_page, null)
      assert.strictEqual(result.data[0].form_responses.last_updated_at, null)
      await client.logout()
    })

    it('should only show consents with response when consent is partially complete', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const response = await respondToForm(consent.id, participant1!.id, false, { q1: 'answer1' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.type, FormsTypeEnum.CONSENT)
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
      assert.strictEqual(result.data[0].form_responses.is_complete, false)
      assert.deepStrictEqual(result.data[0].form_responses.responses, { q1: 'answer1' })
      assert.strictEqual(result.data[0].form_responses.furthest_page, response.furthest_page)
      assert.strictEqual(result.data[0].form_responses.last_updated_at, response.last_updated_at.toISOString())
      await client.logout()
    })

    it('should only show modules when consent is complete', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.type, FormsTypeEnum.MODULE)
      await client.logout()
    })

    it('should show modules sorted by name', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      const modules = sortBy([module1, module2], 'name')

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data[0].name, modules[0].name)
      assert.strictEqual(result.data[0].type, modules[0].type)
      assert.strictEqual(result.data[0].study_id, study.id)
      assert.strictEqual(result.data[0].created_by, coordinatorUser.id)
      assert.strictEqual(result.data[0].version, modules[0].version)
      assert.deepStrictEqual(result.data[0].form, modules[0].form)
      assert.strictEqual(result.data[0].form_responses.id, null)
      assert.strictEqual(result.data[0].form_responses.form_id, null)
      assert.strictEqual(result.data[0].form_responses.participant_id, null)
      assert.strictEqual(result.data[0].form_responses.is_complete, null)
      assert.strictEqual(result.data[0].form_responses.responses, null)
      assert.strictEqual(result.data[0].form_responses.furthest_page, null)
      assert.strictEqual(result.data[0].form_responses.last_updated_at, null)

      assert.strictEqual(result.data[1].name, modules[1].name)

      await client.logout()
    })

    it('should show partial responses for modules', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const modules = sortBy([module1, module2], 'name')
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      const response = await respondToForm(modules[0].id, participant1!.id, false, { q2: 'answer2' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.type, FormsTypeEnum.MODULE)
      assert.strictEqual(result.data[0].id, modules[0].id)
      assert.strictEqual(result.data[0].name, modules[0].name)
      assert.strictEqual(result.data[0].form_responses.id, response.id)
      assert.strictEqual(result.data[0].form_responses.form_id, modules[0].id)
      assert.strictEqual(result.data[0].form_responses.participant_id, participant1!.id)
      assert.strictEqual(result.data[0].form_responses.is_complete, response.is_complete)
      assert.deepStrictEqual(result.data[0].form_responses.responses, { q2: 'answer2' })
      assert.strictEqual(result.data[0].form_responses.furthest_page, response.furthest_page)
      assert.strictEqual(result.data[0].form_responses.last_updated_at, response.last_updated_at.toISOString())
      await client.logout()
    })

    it('should only show incomplete modules', async () => {
      await testUserAuthentication('subjectID', participantUser1.id)

      const modules = sortBy([module1, module2], 'name')
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })
      await respondToForm(modules[0].id, participant1!.id, true, { q2: 'answer2' })
      const response = await respondToForm(modules[1].id, participant1!.id, false, { q3: 'answer3' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.type, FormsTypeEnum.MODULE)
      assert.strictEqual(result.data[0].id, modules[1].id)
      assert.strictEqual(result.data[0].name, modules[1].name)
      assert.strictEqual(result.data[0].form_responses.id, response.id)
      assert.deepStrictEqual(result.data[0].form_responses.responses, { q3: 'answer3' })
      await client.logout()
    })

    it('should return forms specific to a participant', async () => {
      await testUserAuthentication('subjectID', participantUser2.id)

      // participant 1 completes consent, participant 2 does not
      // participant 2 should see the consent form still
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant2!.id },
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.type, FormsTypeEnum.CONSENT)
      assert.strictEqual(result.data[0].id, consent.id)
      await client.logout()
    })

    it('should set participant id to authenticated participant', async () => {
      await testUserAuthentication('subjectID', participantUser2.id)

      // participant 1 completes consent, participant 2 does not
      // participant 2 should see the consent form still
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.type, FormsTypeEnum.CONSENT)
      assert.strictEqual(result.data[0].id, consent.id)
      await client.logout()
    })

    it('should allow admins to view any participant', async () => {
      await testUserAuthentication('subjectID', admin.id)

      // participant 1 completes consent, participant 2 does not
      // participant 2 should see the consent form still
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })

      const participant1Result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      const participant2Result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant2!.id },
      })

      assert.strictEqual(participant1Result.data.length, 2)
      assert.strictEqual(participant1Result.type, FormsTypeEnum.MODULE)

      assert.strictEqual(participant2Result.data.length, 1)
      assert.strictEqual(participant2Result.type, FormsTypeEnum.CONSENT)
      await client.logout()
    })

    it('should return max form version for consents', async () => {
      const updatedConsent = await createNewFormVersion(consent, { new_field: 'new' })
      await testUserAuthentication('subjectID', participantUser1.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.type, FormsTypeEnum.CONSENT)
      assert.strictEqual(result.data[0].id, updatedConsent.id)
      assert.strictEqual(result.data[0].version, updatedConsent.version)
      await client.logout()
    })

    it('should return max form version for modules', async () => {
      const modules = sortBy([module1, module2], 'name')
      const updatedModule = await createNewFormVersion(modules[0], { new_field: 'new' })

      await testUserAuthentication('subjectID', participantUser1.id)
      await respondToForm(consent.id, participant1!.id, true, { q1: 'answer1' })

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant1!.id },
      })

      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.type, FormsTypeEnum.MODULE)
      assert.strictEqual(result.data[0].id, updatedModule.id)
      assert.strictEqual(result.data[0].version, updatedModule.version)
      await client.logout()
    })

    it('should not return results if participant is not in registry study', async () => {
      await testUserAuthentication('subjectID', participantUser3.id)

      const result = await test({
        client,
        service,
        method,
        outcome: 'pass',
        params: { id: participant3!.id },
      })

      assert.strictEqual(result.total, 0)
      assert.strictEqual(result.type, FormsTypeEnum.MODULE)
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
        params: { id: participant1!.id },
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
        params: { id: study.id, data: { title: 'New Title' } },
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
