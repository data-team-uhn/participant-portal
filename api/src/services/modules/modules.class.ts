import type { Paginated } from '@feathersjs/feathers'

import { Application } from '../../declarations'
import type { FormsModel } from '../../models/declarations'
import { FormsTypeEnum } from '../../models/formsType.enum'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

/**
 * The modules service handles logic around which modules need to be completed by a participant.
 */
export class Modules {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Returns a paginated list of forms for a participant to complete.
   *
   * This is limited to forms associated with the study with external_study_id = REGISTRY_EXTERNAL_ID,
   * but may be expanded to handle other studies in the future.
   *
   * If the consent has not been completed:
   * - Return only the consent form
   *
   * If the consent has been completed: (this may require more complex logic in the future)
   * - Return all modules without a response
   *
   * @param {string} id participant id
   */
  async get(id: string) {
    const sequelize = this.app.get('sequelizeClient')

    const modules = await this.app.service('forms').find({
      query: {
        // Only return max version
        where: sequelize.literal(`
          (forms.name, forms.study_id, forms.version) IN (
            SELECT name, study_id, MAX(version)
            FROM forms
            GROUP BY name, study_id
          )
        `),
        // excludes forms when there is a complete response
        $or: [
          { '$form_responses.id$': null },
          { '$form_responses.is_complete$': false }
        ]
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
              where: { id: id },
              attributes: [],
              through: {
                attributes: []
              }
            }]
          },
          {
            model: this.app.services['form-responses'].Model,
            required: false,
            duplicating: false,
            where: { participant_id: id }
          }
        ],
        order: [
          // Put 'consent' forms first, then others by name
          [sequelize.literal(`CASE WHEN forms.type = \'${FormsTypeEnum.CONSENT}\' THEN 0 ELSE 1 END`), 'ASC'],
          ['name', 'ASC']
        ]
      }
    }) as Paginated<FormsModel>

    if (modules.total > 0 && modules.data[0].type === FormsTypeEnum.CONSENT) {
      return {
        ...modules,
        type: FormsTypeEnum.CONSENT,
        total: 1,
        data: [modules.data[0]]
      }
    }

    return { type: FormsTypeEnum.MODULE, ...modules }
  }
}
