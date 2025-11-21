import { Application } from '@feathersjs/feathers'

// This is meant to protect prod, so we default to 'production' if not set to be safe
const ENVIRONMENT = process.env.ENVIRONMENT || 'production'

export default function(app: Application) {

  if (ENVIRONMENT === 'production') {
    console.log('Reset database is disabled in production environment')
    return
  }

  const db = app.get('sequelizeClient')

  console.log('Resetting all models...')

  const models = <any> db.models
  Object.keys(models).forEach(name => {
    if ('associate' in models[name]) {
      models[name].associate(models)
    }
  })

  return db.sync({force: true})
    .then(() => console.log('Successfully forcefully synced database'))
    .catch((err: any) => console.error(err))
}
