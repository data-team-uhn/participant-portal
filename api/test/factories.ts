/**
 * Factory functions to create test entities with default values.
 *
 */
import { faker } from '@faker-js/faker'
import { Model, type InferCreationAttributes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

import type { DataSourceModel, FormsModel, FormResponsesModel, StudyModel, UserModel } from '../src/models/declarations'
import { FormsTypeEnum } from '../src/models/formsType.enum'
import { RoleEnum } from '../src/models/roles.enum'

type EntityWithId<T extends Model<any, any>> = InferCreationAttributes<T> & { id: string }
export type UserWithDataSourceIds = Partial<InferCreationAttributes<UserModel>> & {
  data_source_ids?: string[]
}

/**
 * Creates a base entity with common fields.
 * - id
 * - created_at
 * - updated_at
 *
 * Merges in any additional fields provided.
 */
const createBaseEntity = <T extends Model<any, any>>(fields: Record<string, unknown> = {}): EntityWithId<T> => {
  return {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    ...fields
  } as EntityWithId<T>
}

/**
 * Creates a user entity with default values.
 */
export const createUser = (values: Partial<InferCreationAttributes<UserModel>> = {}): EntityWithId<UserModel> =>
  createBaseEntity<UserModel>({
    email: faker.internet.email(),
    password: faker.word.sample(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    locale: 'en',
    isVerified: true,
    ...values
  })

/**
 * Creates an admin user with default values.
 */
export const createAdmin = (values: Partial<InferCreationAttributes<UserModel>> = {}): EntityWithId<UserModel> =>
  createUser({ ...values, role: RoleEnum.ADMIN })

/**
 * Creates a participant user with default values.
 */
export const createParticipant = (values: UserWithDataSourceIds = {}): EntityWithId<UserModel> =>
  createUser({ ...values, role: RoleEnum.PARTICIPANT })

/**
 * Creates a coordinator user with default values.
 */
export const createCoordinator = (values: UserWithDataSourceIds = {}): EntityWithId<UserModel> =>
  createUser({ ...values, role: RoleEnum.COORDINATOR })

/**
 * Creates a data source entity with default values.
 */
export const createDataSource = (values: Partial<InferCreationAttributes<DataSourceModel>> = {}): EntityWithId<DataSourceModel> =>
  createBaseEntity<DataSourceModel>({
    name: faker.word.sample(),
    ...values
  })
/**
 * Creates a study entity with default values.
 */
export const createStudy = (values: Partial<InferCreationAttributes<StudyModel>> = {}): EntityWithId<StudyModel> =>
  createBaseEntity<StudyModel>({
    external_study_id: faker.word.words(),
    title: faker.word.words(4),
    description: faker.lorem.paragraphs(1),
    stage: 'recruiting',
    type: 'observational',
    phase: '0',
    linkId: faker.number.int(100000).toString(),
    ...values
  })

/**
 * Creates a form entity with default values.
 */
export const createForm = (
  study_id: string,
  created_by: string,
  values: Partial<InferCreationAttributes<FormsModel>> = {}
): EntityWithId<FormsModel> =>
  createBaseEntity<FormsModel>({
    name: faker.word.sample(),
    type: FormsTypeEnum.MODULE,
    study_id,
    created_by,
    version: 1,
    form: {},
    ...values
  })

/**
 * Creates a form response entity with default values.
 */
export const createFormResponse = (
  form_id: string,
  values: Partial<InferCreationAttributes<FormResponsesModel> & { participant_id: string }> = {}
): EntityWithId<FormResponsesModel> =>
  createBaseEntity<FormResponsesModel>({
    form_id,
    responses: {},
    is_complete: false,
    last_updated_at: new Date(),
    ...values
  })
