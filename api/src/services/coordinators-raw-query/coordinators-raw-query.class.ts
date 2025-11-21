import type { Params } from '@feathersjs/feathers'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import { get, includes, keys } from 'lodash'
import { QueryTypes } from 'sequelize'
import type { Application } from '../../declarations'
import { RoleEnum } from '../../models/roles.enum'

interface CoordinatorsRawQueryParams extends Params {
  coordinator_id?: string
}

export class CoordinatorsRawQueryService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  find(params: CoordinatorsRawQueryParams) {
    const coordinator_id = get(params, 'user.coordinator.id', null)
    const service = get(params, 'query.service')
    const role = get(params, 'user.role') as unknown as string
    const db = this.app.get('sequelizeClient')

    if (role !== RoleEnum.ADMIN && !coordinator_id) {
      throw new Forbidden('User does not have permissions to view table')
    }

    const COORDINATOR_ADDITION: string = `
      INNER JOIN (
        SELECT coordinator_id,
              data_source_id
        FROM data_source_coordinators
        WHERE coordinator_id = :coordinator_id
      ) coordinator ON coordinator.data_source_id = data_sources.id
    `

    const RAW_QUERIES: Record<string, string> = {
      'invitations': `
        SELECT  invitations.type,
                invitations.recipient,
                invitations.token,
                invitations.id,
                user_created_by.email as created_by,
                user_revoked_by.email as revoked_by,
                invitations.revoked_at,
                invitations.consumed_at,
                user_consumed_by.email as consumed_by,
                invitations.created_at,
                data_sources.name as data_source,
                data_sources.id as data_source_id,
                sent_messages
        FROM invitations
        LEFT JOIN data_source_invitations on invitations.id = data_source_invitations.invitation_id
        LEFT JOIN data_sources on data_source_invitations.data_source_id = data_sources.id
        LEFT JOIN (
          SELECT id,
                email
          FROM users
        ) user_created_by ON user_created_by.id = invitations.created_by
        LEFT JOIN (
          SELECT id,
                email
          FROM users
        ) user_revoked_by ON user_revoked_by.id = invitations.revoked_by
        LEFT JOIN (
          SELECT id,
                email
          FROM users
        ) user_consumed_by ON user_consumed_by.id = invitations.consumed_by
         LEFT JOIN (
        SELECT messages.email as message_recipient,
               json_agg( 
                (SELECT json_build_object(
                  'triggered_by', users.email,
                  'sent_at', messages.created_at)
                ) ORDER BY messages.created_at) as sent_messages
        FROM messages
        LEFT JOIN users ON users.id = messages.triggered_by
        WHERE type='invitation'
        GROUP BY messages.email
      ) messages ON messages.message_recipient = invitations.recipient
        ${ !!coordinator_id ? COORDINATOR_ADDITION : '' }
        WHERE type='participant'
      `,
      'all-responses': `
        SELECT users.first_name,
               users.last_name,
               users.email,
               participants.birthdate,
               data_source,
               consent_submitted_at,
               consent_response,
               communication_submitted_at,
               communication_response,
               consent_version
          FROM participants
          LEFT JOIN users ON users.id = participants.user_id
          INNER JOIN (
            SELECT form_responses.created_at AS consent_submitted_at,
                  form_responses.responses AS consent_response,
                  form_responses.participant_id,
                  forms.id,
                  forms.type,
                  forms.version AS consent_version
            FROM form_responses
            INNER JOIN forms ON forms.id = form_responses.form_id
            WHERE forms.name='consent'
          ) consent_responses ON consent_responses.participant_id = participants.id
          LEFT JOIN (
            SELECT form_responses.created_at AS communication_submitted_at,
                  form_responses.responses AS communication_response,
                  form_responses.participant_id,
                  forms.id,
                  forms.type,
                  forms.version AS communication_version
            FROM form_responses
            INNER JOIN forms ON forms.id = form_responses.form_id
            WHERE forms.name='communication'
          ) communication_responses ON communication_responses.participant_id = participants.id
          LEFT JOIN (
            SELECT id,
                   name AS data_source
            FROM data_sources
          ) data_sources ON data_sources.id = participants.data_source_id
          ${ !!coordinator_id ? COORDINATOR_ADDITION : '' }
      `
    }

    // Pick corresponding raw query based on service
    const availableQueries = keys(RAW_QUERIES)

    if (!includes(availableQueries, service)) {
      throw new BadRequest('Invalid service', { errors: { service } })
    }

    const query = RAW_QUERIES[service]

    return db.query(query, { raw: true, type: QueryTypes.SELECT, replacements: { coordinator_id } })
  }
}