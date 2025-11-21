import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth, { Storage } from '@feathersjs/authentication-client'
import fetch from 'isomorphic-fetch'

class LocalStorage implements Storage {
  #storage: Record<string, any>

  constructor() {
    this.#storage = {}
  }

  setItem(key: string, value: any) {
    this.#storage[key] = value
  }
  
  getItem (key: string) {
    return this.#storage[key]
  }

  removeItem(key: string) {
    delete this.#storage[key]
  }
}

const client = feathers()
  .configure(rest('http://api-test:8000').fetch(fetch))
  .configure(auth({ storage: new LocalStorage() }))

export default client
