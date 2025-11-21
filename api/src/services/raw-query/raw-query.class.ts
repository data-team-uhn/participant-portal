import { BadRequest } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import { get, includes, keys } from 'lodash'
import { QueryTypes } from 'sequelize'
import type { Application } from '../../declarations'

interface RawQueryParams extends Params {
  service: string
}

const RAW_QUERIES: Record<string, string> = {
  'form-responses': `
      SELECT forms.study_id,
             form_responses.participant_id,
            participants.mrn AS mrn,
             forms.version,
             form_responses.created_at AS signed_date
      FROM form_responses
      LEFT JOIN forms on form_responses.form_id = forms.id
      LEFT JOIN participants ON participants.id = form_responses.participant_id
  `,
  'coordinators': `
      SELECT coordinators.name_prefix,
             coordinators.institution,
             coordinators.approved,
             coordinators.registered,
             coordinators.id,
             coordinators.position,
             users.first_name,
             users.last_name,
             users.email,
             study.external_study_id,
             data_source_aggregated.data_sources
      FROM coordinators
      LEFT JOIN users on coordinators.user_id = users.id
      LEFT JOIN (
          SELECT member_id,
                 array_agg(studies.external_study_id) as external_study_id
          FROM study_coordinators
          LEFT JOIN studies on studies.id = study_coordinators.study_id
          GROUP BY study_coordinators.member_id
          ) study ON coordinators.id = study.member_id
      LEFT JOIN (
          SELECT coordinator_id,
                 array_agg(data_sources.name) as data_sources
          FROM data_source_coordinators
          LEFT JOIN data_sources on data_sources.id = data_source_coordinators.data_source_id
          GROUP BY data_source_coordinators.coordinator_id
          ) data_source_aggregated ON coordinators.id = data_source_aggregated.coordinator_id
  `,
  'participants': `
      SELECT users.first_name,
             users.last_name,
             users.email,
             participants.external_participant_id,
             participants.registered,
             participants.birthdate,
             participants.contact_permission_confirmed,
             study.external_study_id,
             data_sources.name as data_source
      FROM participants
      LEFT JOIN users on participants.user_id = users.id
      LEFT JOIN data_sources on participants.data_source_id = data_sources.id
      LEFT JOIN (
          SELECT member_id,
                 array_agg(studies.external_study_id) as external_study_id
          FROM study_participants
          LEFT JOIN studies on studies.id = study_participants.study_id
          GROUP BY study_participants.member_id
          ) study ON participants.id = study.member_id
  `,
  'study-participants': `
    SELECT  users.first_name,
            users.last_name,
            users.email,
            participants.external_participant_id,
            participants.registered,
            participants.mrn,
            participants.contact_permission_confirmed
    FROM    participants
    LEFT JOIN users on participants.user_id = users.id
    INNER JOIN (
      SELECT  member_id, 
              study_id
      FROM    study_participants
      WHERE study_id=:study_id
    ) study_participant
    ON study_participant.member_id = participants.id
  `,
  'study-coordinators': `
    SELECT  users.first_name,
            users.last_name,
            users.email,
            coordinators.id,
            coordinators.name_prefix,
            coordinators.institution,
            coordinators.registered,
            coordinators.position,
            coordinators.approved
    FROM    coordinators
    LEFT JOIN users on coordinators.user_id = users.id
    INNER JOIN (
      SELECT  member_id, 
              study_id
      FROM    study_coordinators
      WHERE study_id=:study_id
    ) study_coordinator
    ON study_coordinator.member_id = coordinators.id
  `,
  'study-responses': `
    SELECT  users.first_name,
            users.last_name,
            users.email,
            form_responses.created_at AS submitted_at,
            form.form                 AS form,
            form.version,
            form_responses.responses  AS consent_response
    FROM form_responses
    LEFT JOIN participants on form_responses.participant_id = participants.id
    LEFT JOIN users on participants.user_id = users.id
    INNER JOIN (
      SELECT  id, 
              study_id,
              form,
              version
      FROM forms
      ) form
               ON form.id = form_responses.form_id
  `,
  'all-responses': `
    SELECT  users.first_name,
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
    ) data_source ON data_source.id = participants.data_source_id
  `
}

export class RawQueryService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  find(params: RawQueryParams) {
    const service = get(params, 'query.service')
    const study_id = get(params, 'query.study_id')
    const db = this.app.get('sequelizeClient')

    // Pick corresponding raw query based on service
    const availableQueries = keys(RAW_QUERIES)

    if (!includes(availableQueries, service)) {
      throw new BadRequest('Invalid service', { errors: { service } })
    }

    const query = RAW_QUERIES[service]

    return db.query(query, { raw: true, type: QueryTypes.SELECT, replacements: { study_id } })
  }
}
