// TODO: fix types in this file so that we don't use `any`

import { NotFound } from '@feathersjs/errors'
import crypto from 'crypto'
import get from 'lodash/get'

import constants from '../constants'

import type { HookContext } from '../declarations'

const algorithm = 'aes-256-cbc'
const KEY = process.env.SECRET_KEY || ''

const updateErrorMsg = (error: unknown) => {
  if (error instanceof Error && error.message === 'Invalid key length') {
    throw new NotFound('Secret key has not been set')
  } else {
    throw error
  }
}

const generateIv = () => {
  const iv = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    iv[i] = Math.floor(Math.random() * 256)
  }
  return Buffer.from(iv)
}

const encryptValue = (value: crypto.BinaryLike) => {
  const iv = generateIv()
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(KEY), iv)
  let encrypted = cipher.update(value)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

const decryptValue = (value: any) => {
  let [iv, encryptedText] = value.split(':')
  iv = Buffer.from(iv, 'hex')
  encryptedText = Buffer.from(encryptedText, 'hex')
  try {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(KEY), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error: unknown) {
    updateErrorMsg(error)
  }
}

const encrypt = () => (context: HookContext) => {
  const { data, params } = context
  const encryptedFields = get(constants, 'ENCRYPTED_FIELDS', [])

  encryptedFields.forEach((field) => {
    try {
      if (data && data[field]) {
        data[field] = encryptValue(data[field])
      }
      if (params.query && params.query[field]) {
        params.query[field] = encryptValue(params.query[field])
      }
    } catch (error: unknown) {
      updateErrorMsg(error)
    }
  })
  return context
}

const decrypt = () => (context: HookContext) => {
  const { result } = context
  const encryptedFields = get(constants, 'ENCRYPTED_FIELDS', [])

  encryptedFields.forEach((field) => {
    if (result[field]) {
      result[field] = decryptValue(result[field])
    }

    if (Array.isArray(result.data)) {
      result.data.forEach((datum: any) => {
        if (datum[field]) {
          datum[field] = decryptValue(datum[field])
        }
      })
    }
  })
  return context
}

export default {
  decrypt,
  encrypt,
}
