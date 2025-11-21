import assert from 'assert'

import server from '../../src/app'

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = server.service('users')

    assert.ok(service, 'Registered the service')
  })
})
