import { checkContext } from 'feathers-hooks-common'
import get from 'lodash/get'
import type { Paginated } from '@feathersjs/feathers'

import type { HookContext } from '../declarations'
import type { StudyModel } from '../models/declarations'
import { RoleEnum } from '../models/roles.enum'

/**
 * If a user used an open study link, there should be a param called studyLinkId
 *
 * If a path isn't provided, it defaults to 'email'.

 */
const addUserFromStudyLink = () => async(context: HookContext) => {
  const studyLinkId = get(context, 'data.studyLinkId', null)
  if(!studyLinkId) {
    return context
  }
    checkContext(context, 'after', ['create'], 'joinOpenStudyLink')
    const transaction = get(context, 'params.transaction', null)
  
    const role = get(context, 'result.role') || get(context, 'result.user.role')
  
    // Only participants can use an open join link
    if (role !== RoleEnum.PARTICIPANT) {
      return context
    }
  
    const linkId = decodeURIComponent(studyLinkId)
  
    // Get the study that was sent to the user
    const study = (await context.app.service('studies').find({
      query: {
        linkId
      }
    }) as Paginated<StudyModel>).data[0]
  
    const study_id = study.id
  
    const member_id = get(context, 'result.participant.id') || get(context, 'result.user.participant.id')
  
    await context.app.service('study-participants').create({ member_id, study_id }, { sequelize: { transaction } })
  
    return context
  }
  export default addUserFromStudyLink