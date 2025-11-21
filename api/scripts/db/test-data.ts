'use strict'

import type { Paginated } from '@feathersjs/feathers'
import { faker } from '@faker-js/faker'
import Bluebird from 'bluebird'
import { flatMap, times } from 'lodash'
import { Model } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

import { Application } from '../../src/declarations'
import { StudyModel, ParticipantModel, CoordinatorModel } from '../../src/models/declarations'
import { RoleEnum } from '../../src/models/roles.enum'
import findOrCreateAdmin from '../findOrCreateAdmin'

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

  const NUM_COLUMNS = 12
  const NUM_PARTICIPANTS = 12
  const NUM_COORDINATORS = 10
  const NUM_ADMINS = 2 // Will always create at least one

  const modelCreate = (model: any, data: any, options?: any) => {
    const Model = models[model]

    if (Array.isArray(data)) {
      return Model.bulkCreate(data, options)
    }

    return Model.create(data, options)
  }

  const serviceCreate = (service: any, data: any, params?: any) => {
    if (Array.isArray(data)) {
      return Bluebird.each(data, (item: Partial<Model>) => app.service(service).create(item, params))
    }

    return app.service(service).create(data, params)
  }

  console.log('Populating database with test data...')

  const contactRegistryConsentStudy = (await app.service('studies').find({
    query: {
      external_study_id: REGISTRY_EXTERNAL_ID,
      $limit: 1
    }
  }) as Paginated<StudyModel>).data[0]

  const dataSources = [
    {
      id: uuidv4(),
      name: 'AllForOne'
    },
    {
      id: uuidv4(),
      name: 'Genomics Clinic'
    }
  ]

  await serviceCreate('data-sources', dataSources)
  console.log('Added data sources')

  const admin = await findOrCreateAdmin(app, { email: ADMIN_CONTACT })

  const additional_admins = times((NUM_ADMINS - 1), i => {
    const number = (1 + i).toString()
    const username = `admin${number}`

    return {
      id: uuidv4(),
      password: 'password',
      email: `${username}@test.com`,
      role: 'admin'
    }
  })

  const coordinator_users = times(NUM_COORDINATORS, i => {
    const coordinatorNumber = (1 + i).toString()
    const username = coordinatorNumber.length > 3
      ? 'C' + coordinatorNumber
      : 'C' + ('000' + coordinatorNumber).slice(coordinatorNumber.length - 1)

    return {
      id: uuidv4(),
      password: 'password',
      email: `${username}@test.com`,
      role: RoleEnum.COORDINATOR,
      name_prefix: faker.person.prefix(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      institution: 'UHN',
      position: 'Principal Investigator',
      approved: true,
      data_source_ids: [dataSources[i%2].id]
    }
  })

  const participant_users = times(NUM_PARTICIPANTS, i => {
    const patientNumber = (1 + i).toString()
    const username = patientNumber.length > 3
      ? 'P' + patientNumber
      : 'P' + ('000' + patientNumber).slice(patientNumber.length - 1)

    return {
      id: uuidv4(),
      email: `${username}@test.com`,
      password: 'password',
      role: 'participant',
      mrn: faker.number.int().toString(),
      data_source_ids: [dataSources[i % 2].id]
    }
  })

  const sequelize = app.get('sequelizeClient')
  const transaction = await sequelize.transaction()

  await serviceCreate('users', [...additional_admins, ...participant_users, ...coordinator_users], {
    transaction,
    sequelize: { transaction }
  })
  console.log('Added coordinator and participant users')

  await transaction.commit()

  // Verify all users
  await db.query(`
      UPDATE users
      SET is_verified = 't'
  `, { raw: true })
  console.log('Verified all users')

  const participants = ((await app.service('participants').find({ query: { $limit: NUM_COLUMNS } })) as Paginated<ParticipantModel>).data
  const coordinators = ((await app.service('coordinators').find()) as Paginated<CoordinatorModel>).data

  const study_participants = flatMap(participants, participant => {
    return [
      {
        study_id: contactRegistryConsentStudy.id,
        member_id: participant.id
      }
    ]
  })

  await serviceCreate('study-participants', study_participants)
  console.log('Added study participants')

  Bluebird.map(
    coordinators,
    (coordinator) => {
      app.service('coordinators').patch(coordinator.id as any, { approved: true })
    }
  )
  console.log('Approved coordinators to send invitations')

  const study_coordinators = flatMap(coordinators, coordinator => {
    return [
      {
        study_id: contactRegistryConsentStudy.id,
        member_id: coordinator.id
      }
    ]
  })

  await serviceCreate('study-coordinators', study_coordinators)
  console.log('Added study coordinators')

  const invitations = times((NUM_COLUMNS - 1), i => {

    const patientNumber = (1 + i).toString()
    const username = patientNumber.length > 3
      ? 'i' + patientNumber
      : 'i' + ('000' + patientNumber).slice(patientNumber.length-1)

    return ({
      id: uuidv4(),
      type: i % 2 === 0 ? 'coordinator' : 'participant',
      token: uuidv4(),
      study_id: contactRegistryConsentStudy.id,
      recipient: `${username}@test.com`,
      created_by: admin.id,
      data_source_ids: [dataSources[i % 2].id]
    })
  })

  await serviceCreate('invitations', invitations, { user: admin })
  console.log('Added invitations')

  console.log('seeding complete...')
}
