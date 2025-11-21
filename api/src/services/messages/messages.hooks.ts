import { disallow, lowerCase } from 'feathers-hooks-common'
import { BadRequest, TooManyRequests } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import flatMap from 'lodash/flatMap'
import get from 'lodash/get'
import includes from 'lodash/includes'
import min from 'lodash/min'
import omit from 'lodash/omit'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

import constants from '../../constants'
import { MessageModel } from '../../models/declarations'
import TEMPLATES from './templates'

import type { HookOptions, HookContext } from '../../declarations'

const ADMIN_CONTACT = process.env.ADMIN_CONTACT || ''
const ADMIN_CONTACT_NAME = process.env.ADMIN_CONTACT_NAME || ''

// sanity check to confirm email or phone number belongs to a valid participant
const setUserId = () => async (context: HookContext) => {
  const { email, type, triggered_by } = context.data

  if (!email) {
    throw new BadRequest('Missing email address when trying to send a message')
  }

  //if the email is an invitation, the email address won't be in the db because the user doesn't exist yet
  //but we do need to save the user who triggered the invite
  if (type === 'invitation') {
    if (!triggered_by) throw new BadRequest('Missing triggered_by user in invitation message')
    return context
  }

  try {
    const res = await context.app.service('users').find({
      query: {
        email,
        $limit: 1
      }
    })
    const user = get(res, 'data[0]', {})
    context.data.user_id = get(user, 'id')
    context.params.unsubscribed = get(user, 'unsubscribed')
    return context
  } catch {
    throw new BadRequest('There is no valid user associated with this email address')
  }
}

const addToken = () => (context: HookContext) => {
  context.data.token = uuidv4()

  return context
}

/**
 * Rate limit certain email actions to prevent abuse.
 *
 * The first two emails can be sent without delay. Subsequent emails require an exponentially increasing delay.
 * Rate limiting maxes out at one-hour delay.
 */
const rateLimitEmail = () => async (context: HookContext) => {
  const baseRateLimitDelay = 2 * 60 * 1000 // 2 minute
  const maxRateLimitDelay = 60 * 60 * 1000 // 1 hour
  const rateLimitedTypes = [
    'passwordReset',
    'verification',
    'invitation'
  ]

  const { email, type } = context.data

  if (!includes(rateLimitedTypes, type)) {
    return context
  }

  const emails = await context.app.service('messages').find({
    query: {
      email: email,
      type: type,
      created_at: { $gte: moment().subtract(1, 'hour').toDate() } // only consider emails sent in the last hour
    },
    sequelize: { order: [['created_at', 'DESC']] }
  }) as Paginated<MessageModel>

  if (emails.total < 2) {
    return context
  }

  const { time } = constants.GET_TIME()
  const lastEmail = emails.data[0]
  const timeSinceLastEmail = time.diff(moment(lastEmail.created_at), 'milliseconds')
  const requiredDelayMinutes = min([baseRateLimitDelay * Math.pow(2, emails.total - 1), maxRateLimitDelay]) as number

  if (timeSinceLastEmail < requiredDelayMinutes) {
    const waitTime = requiredDelayMinutes - timeSinceLastEmail
    console.log(`Rate limiting email of type "${type}" to ${email}. Must wait another ${waitTime} ms before sending another email.`)
    throw new TooManyRequests(`Please wait before requesting another email of this type.`)
  }

  return context
}

const sendMessage = () => (context: HookContext) => {
  const { email, template, type, templateParams }= context.data
  
  const allowed_unsubscribed_types = [
    'verification',
    'passwordReset'
  ]
  const acceptedTemplates = [
    ...allowed_unsubscribed_types,
    'invitation'
  ]

  if (!email || !template || !includes(acceptedTemplates, template)) {
    throw new BadRequest('Message template is not valid when trying to send a message')
  } else if (!type) {
    throw new BadRequest('Message type is required when trying to send a message')
  }

  context.data = omit(context.data, [ 'template', 'templateParams' ])
  context.data.sent = false

  const from = ADMIN_CONTACT
  const fromName = ADMIN_CONTACT_NAME
  const to = email as string
  const token = context.data.token as string
  const unsubscribed = context.params.unsubscribed as boolean

  if(allowed_unsubscribed_types.includes(template) || !unsubscribed) {
    return context.app.service('mailer').create({
      from,
      fromName,
      to,
      ...TEMPLATES[template](token, ...flatMap(templateParams))
    }, {}, context)
    .then(() => {
      context.data.sent = true
      return context
    })
  }
}

const hooks: HookOptions = {
  before: {
    all: [
      disallow('external'),
    ],
    find: [],
    get: [],
    create: [
      lowerCase('email'),
      rateLimitEmail(),
      setUserId(),
      addToken(),
      sendMessage()
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}

export default hooks
