import type { Paginated } from '@feathersjs/feathers'
import type { UserModel } from '../src/models/declarations'
import type { Application } from '../src/declarations'

export default async function findOrCreateAdmin(app: Application, data: object): Promise<UserModel> {
  const result = await app.service('users').find({ query: data }) as Paginated<UserModel>

  if (result.total > 0) {
    const admin = result.data[0]
    console.log('Found existing admin', admin.email)
    return admin
  }

  const sequelize = app.get('sequelizeClient')
  const transaction = await sequelize.transaction()
  const admin = await app.service('users').create(
    {
      ...data,
      password: 'password',
      role: 'admin'
    },
    {
      transaction,
      sequelize: { transaction }
    }
  )
  await transaction.commit()

  console.log('Created new admin', admin.email)
  return admin
}
