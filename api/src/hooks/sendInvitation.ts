import { GeneralError } from '@feathersjs/errors'
import { checkContext } from 'feathers-hooks-common'

import type { HookContext } from '../declarations'
import QRCode from 'qrcode'

const APP_BASE_URL = process.env.APP_BASE_URL
const ADMIN_CONTACT = process.env.ADMIN_CONTACT || ''

/**
 * Sends an invitation email to the user with a link to register.
 */
const sendInvitation = () => async (context: HookContext) => {
  checkContext(context, 'after', ['create', 'patch'], 'sendInvitation')
  const { recipient, type, token, study_id } = context.result

  if (!context.params.user) throw new GeneralError('Failed to send invitation message.')
  
  const triggered_by = context.params.user.id

  //will have a transaction if part of the create hook
  const transaction = context.params?.transaction

  let study
  try {
    study = await context.app.service('studies').get(study_id)
  } catch {
    throw new GeneralError('Failed to send invitation message. Study does not exist.')
  }

  const invitationUrl = `${APP_BASE_URL}/register?type=${type}&token=${token}&email=${recipient}`

  try {
    let qrCode
    QRCode.toString(invitationUrl, { type: 'svg', width: 200 }, async function (err: any, url: any) {
      qrCode = url
    })
    const templateParams = { invitationUrl, qrCode }
    await context.app.service('messages').create({
      email: recipient,
      from: ADMIN_CONTACT,
      triggered_by,
      templateParams,
      template: 'invitation',
      type: 'invitation'
    }, { sequelize: { transaction } })
    return context
  } catch {
    throw new GeneralError('Failed to send invitation message')
  }
}

export default sendInvitation
