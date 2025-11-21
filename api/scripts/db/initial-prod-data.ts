'use strict'

import { v4 as uuidv4 } from 'uuid'

import { Application } from '../../src/declarations'
import findOrCreateAdmin from '../findOrCreateAdmin'
import updateForms from './surveys/update-forms'

const ADMIN_CONTACT = process.env.ADMIN_CONTACT
const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'
// This is meant to protect prod, so we default to 'production' if not set to be safe
const ENVIRONMENT = process.env.ENVIRONMENT || 'production'

export default async function(app: Application) {

  if (ENVIRONMENT === 'production') {
    console.log('Test data seeding is disabled in production environment')
    return
  }
  
  const db = app.get('sequelizeClient')
  const models = db.models

  const modelCreate = (model: any, data: any, options?: any) => {
    const Model = models[model]

    if (Array.isArray(data)) {
      return Model.bulkCreate(data, options)
    }

    return Model.create(data, options)
  }

  console.log('Populating database with initial prod data...')

  const admin = await findOrCreateAdmin(app, { email: ADMIN_CONTACT })

  // Verify all users
  await db.query(`
      UPDATE users
      SET is_verified = 't'
      WHERE id = :id
  `, { raw: true, replacements: { id: admin.id } })
  console.log('Verified admin user')

  const contactRegistryConsentStudy = {
    id: uuidv4(),
    external_study_id: REGISTRY_EXTERNAL_ID,
    title: 'Connect',
    description: 'Connect is a national registry for people who have had genetic testing to support and engage with health research.',
    stage: 'invitation',
    type: 'registry',
    phase: 'N/A',
    linkId: REGISTRY_EXTERNAL_ID
  }

  await modelCreate('studies', contactRegistryConsentStudy)
  console.log('Added studies')

  await updateForms(app)

  console.log('Seeding prod complete...')
}
