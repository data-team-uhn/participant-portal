import Bluebird from 'bluebird'

import { Application } from '../../src/declarations'
import findOrCreateAdmin from '../findOrCreateAdmin'

const ADMIN_CONTACT = process.env.ADMIN_CONTACT
// This is meant to protect prod, so we default to 'production' if not set to be safe
const ENVIRONMENT = process.env.ENVIRONMENT || 'production'

export default async function(app: Application): Promise<void> {
  if (ENVIRONMENT === 'production') {
    console.log('Test data seeding is disabled in production environment')
    return
  }
  
  const serviceCreate = (service: any, data: object, params?: object): Promise<any> => {
    if (Array.isArray(data)) {
      return Bluebird.each(data, (item) => app.service(service).create(item, params))
    }

    return app.service(service).create(data, params)
  }

  console.log('Populating database with admin settings...')

  const admin = await findOrCreateAdmin(app, { email: ADMIN_CONTACT })

  // Initial admin settings
  const adminSettingsEntry = [
    {
      id: 'banner_text',
      value: 'The Connect Portal will undergo scheduled maintenance. We expect it to take 5 to 15 minutes. You will be automatically logged out and any progress will be saved. You cannot log in or update your account during this time.',
      editor_id: admin.id
    },
    {
      id: 'banner_on',
      value: 'false',
      editor_id: admin.id
    },
    {
      id: 'restrict_login',
      value: 'false',
      editor_id: admin.id
    },
    {
      id: 'loggedout_time',
      value: new Date().toString(),
      editor_id: admin.id
    }
  ]

  await serviceCreate('settings', adminSettingsEntry)
  console.log('Added admin and settings')
}
