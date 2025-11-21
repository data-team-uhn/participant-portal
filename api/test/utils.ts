import assert from 'assert'
import get from 'lodash/get'
import { sign } from 'jsonwebtoken'

import server from '../src/app'
import client from './client'

import type { Application, ServiceTypes } from '../src/declarations'

export enum ERROR {
  BAD_REQUEST = 400,
  NOT_AUTHENTICATED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
}

// TODO: Fix param types so that we don't use 'any'
interface TestParams {
  client: any
  service: keyof ServiceTypes
  method: string
  outcome: 'pass' | 'fail'
  params?: any
  errorCode?: ERROR
}

export const test = ({client, service, method, outcome, params, errorCode}: TestParams) => {
  const call = (service: any) => service
    .then((result: any) => {
      switch(outcome) {
      case 'pass':
        return result
      case 'fail':
        const error = new Error('Should not have created')
        console.error('ERROR: ' + error.message)
        throw error
      default:
        throw new Error('Incorrect outcome not specified for test')
      }
    })
    .catch((error: any) => {
      if (outcome === 'pass') {
        throw new Error(`Expected test to pass, but an error was raised:\n${error.message}`)
      }

      assert.strictEqual(error.code, errorCode)
      return error
    })

  const id = get(params, 'id', null)
  const data = get(params, 'data')
  const query = get(params, 'query', {})

  switch(method) {
  case 'get':
    return call(client.service(service).get(id, { query }))
  case 'find':
    return call(client.service(service).find({ query }))
  case 'create':
    return call(client.service(service).create(data, { query }))
  case 'update':
  case 'patch':
    return call(client.service(service)[method](id, data, query ))
  case 'remove':
    return call(client.service(service).remove(id, { query }))
  default:
    throw new Error('Unknown method specified for test')
  }
}

export const testUserAuthentication = (authType: string, userID: string) => {
  if (authType === 'subjectID') {
    const accessToken_obj = {
      'authType': authType,
      'sub': userID
    }

    const {secret, jwtOptions} = server.get('authentication')
    const token = sign(accessToken_obj, secret, jwtOptions)

    return client.authenticate({ strategy: 'jwt', 'accessToken': token })
  }
  else {
    throw new Error('Unknown authentication type')
  }
}

export const verifyAllUsers = (server: Application) => {
  const db = server.get('sequelizeClient')
  return db.query(`
      UPDATE users
      SET is_verified = true
  `, { raw: true })
}
