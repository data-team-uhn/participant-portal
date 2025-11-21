import { BadRequest, Forbidden } from '@feathersjs/errors'
import type { Paginated } from '@feathersjs/feathers'
import { checkContext } from 'feathers-hooks-common'
import { map } from 'lodash'

import type { HookContext } from '../declarations'
import type { InvitationModel, DataSourceInvitationModel, MessageModel } from '../models/declarations'
import { RoleEnum } from '../models/roles.enum'

const validateInvitation = () => async (context: HookContext) => {
  checkContext(context, 'before', ['create'], 'validateInvitation')
  const transaction = context.params.transaction

  if (!transaction) {
    throw new Error('No transaction found in context.params')
  }
  const { role, token, email } = context.data

  // This participant will be added without membership to a study
  if (role === RoleEnum.PARTICIPANT && !token) {
    return context
  }

  if (!token || !email || !role) {
    throw new BadRequest('Missing token, email or role. Cannot validate invitation')
  }

  try {
    const invitation = await context.app.service('invitations').find({
      query: {
        recipient: email,
        type: role,
        token,
        revoked_by: { $eq: null },
        consumed_by: { $eq: null }
      }
    }) as Paginated<InvitationModel>

    const messages = await context.app.service('messages').find({
      query: {
        email,
        type: 'invitation',
        sent: true
      }
    }) as Paginated<MessageModel>

    if (invitation.total === 1 && messages.total >= 1) {
      /**
       * Find the data source IDs from the association with invitations, and add it to the user context
       * So that it can be added to the participants table
       */
      const data_source_invitations = await context.app.service('data-source-invitations').find({
        query: { invitation_id: invitation.data[0].id, $select: ['data_source_id'] },
        sequelize: { transaction }
      }) as Paginated<DataSourceInvitationModel>

      if (role === RoleEnum.PARTICIPANT && data_source_invitations.total !== 1) {
          throw new Forbidden('You do not have permission to register')
      }
      const data_source_ids = map(data_source_invitations.data, data_source_invitation => data_source_invitation.data_source_id)
      context.data = {...context.data, data_source_ids: data_source_ids}
      return context
    } else {
      throw new BadRequest()
    }

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message)
    } else {
      console.log(error)
    }

    throw new BadRequest('You do not have permission to register')
  }
}

export default validateInvitation
