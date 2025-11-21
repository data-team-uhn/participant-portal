import type { Optional } from 'sequelize'

import { get, isEqual } from 'lodash'

import { Application } from '../../../src/declarations'
import type { FormsModel, StudyModel } from '../../../src/models/declarations'
import { FormsTypeEnum } from '../../../src/models/formsType.enum'
import connectClinicalPhenotypes from './connectClinicalPhenotypes.json'
import connectCommunicationPreferences from './connectCommunicationPreferences.json'
import connectConsent from './connectConsent.json'
import connectDemographics from './connectDemographics.json'
import connectGeneticInformation from './connectGeneticInformation.json'
import Bluebird from 'bluebird'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

interface FormsType {
  external_study_id: string
  name: string
  type?: FormsTypeEnum
  form: object
}

const FORMS: FormsType[] = [
  {
    external_study_id: REGISTRY_EXTERNAL_ID,
    name: 'consent',
    type: FormsTypeEnum.CONSENT,
    form: connectConsent
  },
  {
    external_study_id: REGISTRY_EXTERNAL_ID,
    name: 'demographics',
    type: FormsTypeEnum.MODULE,
    form: connectDemographics
  },
  {
    external_study_id: REGISTRY_EXTERNAL_ID,
    name: 'communication',
    type: FormsTypeEnum.MODULE,
    form: connectCommunicationPreferences
  },
  {
    external_study_id: REGISTRY_EXTERNAL_ID,
    name: 'clinical_phenotypes',
    type: FormsTypeEnum.MODULE,
    form: connectClinicalPhenotypes
  },
  {
    external_study_id: REGISTRY_EXTERNAL_ID,
    name: 'genetic_information',
    type: FormsTypeEnum.MODULE,
    form: connectGeneticInformation
  }
]

export default async function(app: Application) {
  const db = app.get('sequelizeClient')
  const models = db.models

  const modelCreate = (model: string, data: Optional<any, string>, options?: object) => {
    const Model = models[model]

    if (Array.isArray(data)) {
      return Model.bulkCreate(data, options)
    }

    return Model.create(data, options)
  }

  console.log('Updating database with newest surveys...')

  const updateForm = async (form: FormsType) => {
    const study = await models['studies'].findOne({
      where: { external_study_id: form.external_study_id },
      raw: true
    }) as StudyModel

    if (!study) {
      // colour error in red
      console.log('\x1b[31m%s\x1b[0m', `Could not find study with external id ${form.external_study_id}`)
      return
    }

    const existingForm = await models['forms'].findOne({
      where: { study_id: study.id, name: form.name },
      order: [['version', 'DESC']],
      raw: true
    }) as FormsModel

    // deep compare the questionnaire json looking for changes
    if (isEqual(form.form, get(existingForm, 'form'))) {
      console.log(`No changes detected for ${study.external_study_id}-${form.name}, skipping update`)
      return
    }

    // colour new changes in green
    console.log('\x1b[32m%s\x1b[0m', `Found changes for ${study.external_study_id}-${form.name}, updating...`)

    return modelCreate('forms', {
      study_id: study.id,
      name: form.name,
      form: form.form,
      type: form.type,
      version: get(existingForm, 'version', 0) + 1
    })
  }

  try {
    await Bluebird.each(FORMS, updateForm)
    console.log('Successfully updated database with surveys')
  } catch (err) {
    console.error(err)
  }
}
