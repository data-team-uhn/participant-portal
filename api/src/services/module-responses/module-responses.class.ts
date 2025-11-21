import { BadRequest } from '@feathersjs/errors'
import { type Paginated, type Params } from '@feathersjs/feathers'

import { get } from 'lodash'

import { Application } from '../../declarations'
import type { FormResponsesModel } from '../../models/declarations'
import { FormsTypeEnum } from '../../models/formsType.enum'


const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

export class ModuleResponses {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params: Params) {
    const sequelize = this.app.get('sequelizeClient')
    const type = get(params, 'query.type', undefined) as FormsTypeEnum

    // Note: We should be protecting the participant_id query param in hooks
    const participant_id = get(params, 'query.participant_id', undefined)

    if (!participant_id) {
      throw new BadRequest('participant_id query parameter is required')
    }

    return await this.app.service('forms').find({
      query: {
        '$form_responses.is_complete$': true,
        ...(type && { type })
      },
      sequelize: {
        nest: true,
        include: [
          {
            model: this.app.services.studies.Model,
            required: true,
            duplicating: false,
            where: { external_study_id: REGISTRY_EXTERNAL_ID },
            attributes: [],
            include: [{
              model: this.app.services.participants.Model,
              required: true,
              duplicating: false,
              where: { id: participant_id },
              attributes: [],
              through: {
                attributes: []
              }
            }]
          },
          {
            model: this.app.services['form-responses'].Model,
            required: true,
            duplicating: false,
            where: { participant_id }
          }
        ],
        order: [
          // Put 'consent' forms first, then others by name
          [sequelize.literal(`CASE WHEN forms.type = \'${FormsTypeEnum.CONSENT}\' THEN 0 ELSE 1 END`), 'ASC'],
          ['name', 'ASC']
        ]
      }
    }) as Paginated<FormResponsesModel>
  }
}
