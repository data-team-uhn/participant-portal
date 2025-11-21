/**
 * Overview of authentication service requirements:
 *
 * - Users must be verified to authenticate
 * - Sensitive fields (password, verifyToken, resetToken, participant.mrn) must not be sent to clients
 * - Participants must be added to a study if they authenticate with a valid study link
 */

import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { has } from 'lodash'

import resetDb from '../scripts/db/reset'
import { StudyCoordinatorModel, StudyParticipantModel } from '../src/models/declarations'
import client from './client'
import { createAdmin, createCoordinator, createDataSource, createParticipant, createStudy } from './factories'
import server from './server'
import { verifyAllUsers } from './utils'

const dataSource = createDataSource({})
const participantUser = createParticipant({ data_source_ids: [dataSource.id] })
const coordinatorUser = createCoordinator({ data_source_ids: [dataSource.id] })
const adminUser = createAdmin({})
const unverifiedUser = createParticipant({ data_source_ids: [dataSource.id] })
const study = createStudy({})

describe('authentication', () => {
  it('registered the authentication service', () => {
    assert.ok(server.service('authentication'))
  })

  describe('local strategy', () => {
    before(async () => {
      try {
        await resetDb(server)

        const sequelize = server.get('sequelizeClient')
        const transaction = await sequelize.transaction()
        const params = { transaction, sequelize: { transaction } }

        await server.service('data-sources').create(dataSource)
        await server.service('users').create(participantUser, params)
        await server.service('users').create(coordinatorUser, params)
        await server.service('users').create(adminUser, params)
        await server.service('studies').create(study)

        await transaction.commit()
        await verifyAllUsers(server)

        const transaction2 = await sequelize.transaction()
        const params2 = { transaction: transaction2, sequelize: { transaction: transaction2 } }
        await server.service('users').create(unverifiedUser, params2)
        await transaction2.commit()

      } catch (error: any) {
        console.error(error)
        // Do nothing, it just means the user already exists and can be tested
      }
    })

    it('should authenticate user and create accessToken', async () => {
      const { user, accessToken } = await server.service('authentication').create({
        strategy: 'local',
        email: participantUser.email,
        password: participantUser.password
      })

      assert.ok(accessToken, 'Created access token for user')
      assert.ok(user, 'Includes user in authentication data')
    })

    it('should fail authentication if password is incorrect', async () => {
      try {
        await server.service('authentication').create({
          strategy: 'local',
          email: participantUser.email,
          password: `${participantUser.password} + 1`
        })

        assert.fail('expected error not thrown')
      } catch (err) {
        assert.equal(err, 'NotAuthenticated: Invalid login', `Expected 'invalid login' error to be thrown, but got ${err}`)
      }
    })

    it('should fail authentication if user is not verified', async () => {
      try {
        await server.service('authentication').create({
          strategy: 'local',
          email: unverifiedUser.email,
          password: unverifiedUser.password
        })

        assert.fail('expected error not thrown')
      } catch (err) {
        assert.equal(err, 'Forbidden: User is not verified', `Expected 'user is not verified' error to be thrown, but got ${err}`)
      }
    })

    it('should show sensitive user fields for internal requests', async () => {
      const { user } = await server.service('authentication').create({
        strategy: 'local',
        email: participantUser.email,
        password: participantUser.password
      })

      assert(has(user, 'password'), 'Password is not included in user data')
      assert(has(user, 'verifyToken'), 'Verify token is not included in user data')
      assert(has(user, 'resetToken'), 'Reset token is not included in user data')
    })

    it('should hide sensitive participant fields for external requests', async () => {
      const { user } = await client.service('authentication').create({
        strategy: 'local',
        email: participantUser.email,
        password: participantUser.password
      })

      assert(!has(user, 'password'), 'Password should not be included in user data')
      assert(!has(user, 'verifyToken'), 'Verify token should not be included in user data')
      assert(!has(user, 'resetToken'), 'Reset token should not be included in user data')
      assert(!has(user, 'participant.mrn'), 'MRN should not be included in user data')
    })

    it('should hide sensitive coordinator fields for external requests', async () => {
      const { user } = await client.service('authentication').create({
        strategy: 'local',
        email: coordinatorUser.email,
        password: coordinatorUser.password
      })

      assert(!has(user, 'password'), 'Password should not be included in user data')
      assert(!has(user, 'verifyToken'), 'Verify token should not be included in user data')
      assert(!has(user, 'resetToken'), 'Reset token should not be included in user data')
    })

    it('should hide sensitive admin fields for external requests', async () => {
      const { user } = await client.service('authentication').create({
        strategy: 'local',
        email: adminUser.email,
        password: adminUser.password
      })

      assert(!has(user, 'password'), 'Password should not be included in user data')
      assert(!has(user, 'verifyToken'), 'Verify token should not be included in user data')
      assert(!has(user, 'resetToken'), 'Reset token should not be included in user data')
    })

    it('should add participant to a study if params are in place', async () => {
      const { user } = await client.service('authentication').create({
        strategy: 'local',
        email: participantUser.email,
        password: participantUser.password,
        studyLinkId: encodeURIComponent(study.linkId)
      })

      const studyParticipants = await server.service('study-participants').find({
        query: {
          member_id: user.participant.id,
          study_id: study.id
        }
      }) as Paginated<StudyParticipantModel>

      assert.equal(studyParticipants.total, 1, 'User was not added to the study via the study link')
    })

    it('should not add coordinator to a study if params are in place', async () => {
      const { user } = await client.service('authentication').create({
        strategy: 'local',
        email: coordinatorUser.email,
        password: coordinatorUser.password,
        studyLinkId: encodeURIComponent(study.linkId)
      })

      const studyCoordinators = await server.service('study-coordinators').find({
        query: {
          member_id: user.coordinator.id,
          study_id: study.id
        }
      }) as Paginated<StudyCoordinatorModel>

      assert.equal(studyCoordinators.total, 0, 'User was added to the study via the study link')
    })
  })
})
