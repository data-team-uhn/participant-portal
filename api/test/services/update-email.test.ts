/**
 * Overview of 'update-email' service requirements:
 *
 * - Only supports 'create' method; other methods should return NOT_ALLOWED error.
 * - 'create' method requires 'currentEmail' and 'newEmail' fields.
 * - 'create' method requires either 'currentPassword' or 'currentVerifyToken'.
 * - Validates user credentials based on provided password or token.
 * - Updates user's email to 'newEmail', sets 'isVerified' to false.
 * - Sends a verification email to the new email address.
 * - Hides sensitive fields (password, verifyToken, resetToken) in the response.
 * - Admins are not allowed to change their email via this service.
 */
import { faker } from '@faker-js/faker'
import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { has, toLower } from 'lodash'

import resetDb from '../../scripts/db/reset'
import { MessageModel } from '../../src/models/declarations'
import client from '../client'
import { createAdmin, createDataSource, createParticipant } from '../factories'
import server from '../server'
import { ERROR, test } from '../utils'

const service = 'update-email'

const dataSource = createDataSource({})

const adminUser = createAdmin({})
const participantUser = createParticipant({ data_source_ids: [dataSource.id] })
const unverifiedUser = createParticipant({ data_source_ids: [dataSource.id] })
const unverifiedUserToken = 'unverified-user-token'

describe('\'update-email\' service', () => {
  it('registered the service', () => {
    const service = server.service('update-email')

    assert.ok(service, 'Registered the service')
  })

  // Create forms and associations for `find` tests
  before(async () => {
    try {
      await resetDb(server)

      const sequelize = server.get('sequelizeClient')
      const transaction = await sequelize.transaction()
      const params = { transaction, sequelize: { transaction } }

      await server.service('data-sources').create(dataSource)
      await server.service('users').create(adminUser, params)
      await server.service('users').create(participantUser, params)
      await server.service('users').create(unverifiedUser, params)

      await transaction.commit()

    } catch (err) {
      console.error(err)
      throw err
    }
  })

  // Reset email and verification status before each test
  beforeEach(async () => {
    const db = server.get('sequelizeClient')

    await db.query(`
        UPDATE users
        SET email       = '${toLower(participantUser.email)}',
            is_verified = true
        WHERE id = '${participantUser.id}'
    `, { raw: true })

    await db.query(`
        UPDATE users
        SET email        = '${toLower(unverifiedUser.email)}',
            is_verified  = false,
            verify_token = '${unverifiedUserToken}'
        WHERE id = '${unverifiedUser.id}'
    `, { raw: true })

    await db.query(`
        DELETE
        FROM messages
    `, { raw: true })
  })

  it('should not support get requests', async () => {
    await test({
      client,
      service,
      method: 'get',
      outcome: 'fail',
      errorCode: ERROR.NOT_ALLOWED,
      params: { id: 'some-id' }
    })
  })

  it('should not support find requests', async () => {
    await test({
      client,
      service,
      method: 'find',
      outcome: 'fail',
      errorCode: ERROR.NOT_ALLOWED,
    })
  })

  it('should not support patch requests', async () => {
    await test({
      client,
      service,
      method: 'patch',
      outcome: 'fail',
      errorCode: ERROR.NOT_ALLOWED,
    })
  })

  it('should not support update requests', async () => {
    await test({
      client,
      service,
      method: 'update',
      outcome: 'fail',
      errorCode: ERROR.NOT_ALLOWED,
    })
  })

  it('should not support delete requests', async () => {
    await test({
      client,
      service,
      method: 'remove',
      outcome: 'fail',
      errorCode: ERROR.NOT_ALLOWED,
    })
  })

  describe('create', () => {
    it('should not update admins', async () => {
      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.FORBIDDEN,
        params: { data: { newEmail: faker.internet.email(), currentEmail: adminUser.email, currentPassword: adminUser.password } },
      })

      assert.strictEqual(result.message, 'Admins are not allowed to change their email via this service')
    })

    it('should require currentEmail field', async () => {
      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.BAD_REQUEST,
        params: { data: { newEmail: faker.internet.email() } }
      })

      assert.strictEqual(result.message, 'Field currentEmail does not exist. (required)')
    })

    it('should require newEmail field', async () => {
      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.BAD_REQUEST,
        params: { data: { currentEmail: faker.internet.email() } }
      })

      assert.strictEqual(result.message, 'Field newEmail does not exist. (required)')
    })

    it('should require currentPassword or currentVerifyToken field', async () => {
      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.BAD_REQUEST,
        params: { data: { newEmail: faker.internet.email(), currentEmail: participantUser.email } }
      })

      assert.strictEqual(result.message, 'currentPassword or currentVerifyToken is required')
    })

    it('should update email when password is provided', async () => {
      const newEmail = faker.internet.email()

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { newEmail, currentEmail: participantUser.email, currentPassword: participantUser.password } }
      })

      assert.strictEqual(result.email, toLower(newEmail))
      assert.strictEqual(result.isVerified, false)
    })

    it('should update email when verification token is provided', async () => {
      const newEmail = faker.internet.email()

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { newEmail, currentEmail: unverifiedUser.email, currentVerifyToken: unverifiedUserToken } }
      })

      assert.strictEqual(result.email, toLower(newEmail))
      assert.strictEqual(result.isVerified, false)
    })

    it('should send verification email', async () => {
      const newEmail = faker.internet.email()

      await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { newEmail, currentEmail: participantUser.email, currentPassword: participantUser.password } }
      })
      const message = await server.service('messages').find({
        query: {
          email: toLower(newEmail),
          type: 'verification'
        }
      }) as Paginated<MessageModel>

      assert.strictEqual(message.total, 1, 'Expected one verification email to be sent')
    })

    it('should send hide sensitive fields', async () => {
      const newEmail = faker.internet.email()

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'pass',
        params: { data: { newEmail, currentEmail: participantUser.email, currentPassword: participantUser.password } }
      })

      assert.ok(!has(result, 'password'), 'Expected password field to be removed')
      assert.ok(!has(result, 'verifyToken'), 'Expected verifyToken field to be removed')
      assert.ok(!has(result, 'resetToken'), 'Expected resetToken field to be removed')
    })

    it('should throw an error if the user doesn\'t exist', async () => {
      const currentEmail = faker.internet.email()
      const newEmail = faker.internet.email()

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { data: { newEmail, currentEmail, currentPassword: participantUser.password } }
      })

      assert.strictEqual(result.message, 'Invalid credentials provided')
    })

    it('should throw an error if the password is incorrect', async () => {
      const newEmail = faker.internet.email()

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { data: { newEmail, currentEmail: participantUser.email, currentPassword: `${participantUser.password}abc` } }
      })

      assert.strictEqual(result.message, 'Invalid credentials provided')
    })

    it('should throw an error if the verification token is incorrect', async () => {
      const newEmail = faker.internet.email()

      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.NOT_AUTHENTICATED,
        params: { data: { newEmail, currentEmail: unverifiedUser.email, currentVerifyToken: `${unverifiedUserToken}abc` } }
      })

      assert.strictEqual(result.message, 'Invalid credentials provided')
    })

    it('should throw an error if the new email is in use', async () => {
      const result = await test({
        client,
        service,
        method: 'create',
        outcome: 'fail',
        errorCode: ERROR.BAD_REQUEST,
        params: { data: { newEmail: unverifiedUser.email, currentEmail: participantUser.email, currentPassword: participantUser.password } }
      })

      assert.strictEqual(result.message, 'Validation error')
    })
  })
})
