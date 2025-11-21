// See docs for using sequelize with Typescript
// https://sequelize.org/docs/v6/other-topics/typescript/

import {
  Association,
  DataTypes,
  Model,
  type CreationOptional,
  type EnumDataType,
  type InferAttributes,
  type InferCreationAttributes,
  type ForeignKey,
  type NonAttribute
} from 'sequelize'

import { SettingEnum } from './settings.enum'
import { FormsTypeEnum } from './formsType.enum'
import { RoleEnum } from './roles.enum'

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID> // Can be omitted when creating new instances
  declare email: string
  declare password: string
  declare first_name?: string
  declare last_name?: string
  declare role: RoleEnum
  declare locale: CreationOptional<typeof DataTypes.STRING>
  declare isVerified: CreationOptional<typeof DataTypes.BOOLEAN>
  declare subscribed: CreationOptional<typeof DataTypes.BOOLEAN>
  declare verifyToken?: string
  declare verifyExpires?: Date
  declare resetToken?: string
  declare resetExpires?: Date
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  declare static associations: {
    messages: Association<UserModel, MessageModel>
    participants: Association<UserModel, ParticipantModel>
    creator: Association<UserModel, FormsModel>
  }
}

export class MessageModel extends Model<InferAttributes<MessageModel>, InferCreationAttributes<MessageModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare user_id?: ForeignKey<UserModel['id']>
  declare triggered_by?: ForeignKey<UserModel['id']>
  declare email?: string
  declare type: string
  declare sent: boolean
  declare token: string
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  // eagerly-loaded associations
  declare user?: NonAttribute<UserModel>
}

export class FormsModel extends Model<InferAttributes<FormsModel>, InferCreationAttributes<FormsModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare name: string
  declare type: FormsTypeEnum
  declare study_id: ForeignKey<StudyModel['id']>
  declare created_by: ForeignKey<UserModel['id']>
  declare version: number
  declare form: Record<string, any>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

export class FormResponsesModel extends Model<InferAttributes<FormResponsesModel>, InferCreationAttributes<FormResponsesModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare form_id: ForeignKey<FormsModel['id']>
  declare participant_id: ForeignKey<ParticipantModel['id']>
  declare is_complete: boolean
  declare responses: Record<string, any>
  declare furthest_page: number
  declare created_at: CreationOptional<Date>
  declare last_updated_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

export class StudyModel extends Model<InferAttributes<StudyModel>, InferCreationAttributes<StudyModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID> // Can be omitted when creating new instances
  declare external_study_id: string
  declare title: string
  declare description: string
  declare stage: 'recruiting' | 'active' | 'invitation' | 'withdrawn' | 'completed' | 'hold'
  declare phase: string
  declare type: string
  declare linkId: string
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  declare static associations: {
    participants: Association<StudyModel, ParticipantModel>
  }
}

export class ParticipantModel extends Model<InferAttributes<ParticipantModel>, InferCreationAttributes<ParticipantModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID> // Can be omitted when creating new instances
  declare user_id: ForeignKey<UserModel['id']>
  declare external_participant_id: string
  declare birthdate: Date
  declare mrn: string
  declare registered: Date
  declare viewed_registry_consent: Date
  declare contact_permission_confirmed: Date
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  declare static associations: {
    users: Association<ParticipantModel, UserModel>
    studies: Association<ParticipantModel, StudyModel>
    participant_responses: Association<ParticipantModel, FormResponsesModel>
  }
}

export class StudyParticipantModel extends Model<InferAttributes<StudyParticipantModel>, InferCreationAttributes<StudyParticipantModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID> // Can be omitted when creating new instances
  declare member_id: ForeignKey<ParticipantModel['id']>
  declare study_id: ForeignKey<StudyModel['id']>
  declare external_id: string
  declare id_is_validated: boolean
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
  declare static associations: {
    participants: Association<StudyParticipantModel, ParticipantModel>
    studies: Association<StudyParticipantModel, StudyModel>
  }
}

export class CoordinatorModel extends Model<InferAttributes<CoordinatorModel>, InferCreationAttributes<CoordinatorModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID> // Can be omitted when creating new instances
  declare user_id: ForeignKey<UserModel['id']>
  declare name_prefix: string
  declare institution: string
  declare position: string // TODO: This should probably be on the coordinator_study table
  declare approved: typeof DataTypes.BOOLEAN
  declare registered: Date
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  declare static associations: {
    users: Association<CoordinatorModel, UserModel>
    studies: Association<CoordinatorModel, StudyModel>
  }
}

export class StudyCoordinatorModel extends Model<InferAttributes<StudyCoordinatorModel>, InferCreationAttributes<StudyCoordinatorModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID> // Can be omitted when creating new instances
  declare member_id: ForeignKey<CoordinatorModel['id']>
  declare study_id: ForeignKey<StudyModel['id']>

  declare static associations: {
    coordinators: Association<StudyCoordinatorModel, CoordinatorModel>
    studies: Association<StudyCoordinatorModel, StudyModel>
  }
}

export class InvitationModel extends Model<InferAttributes<InvitationModel>, InferCreationAttributes<InvitationModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare type: string
  declare token: string
  declare study_id: ForeignKey<StudyModel['id']>
  declare recipient: string
  declare created_by: ForeignKey<UserModel['id']>
  declare revoked_by?: ForeignKey<UserModel['id']>
  declare revoked_at?: Date
  declare consumed_at?: Date
  declare consumed_by?: ForeignKey<UserModel['id']>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  // eagerly-loaded associations
  declare study?: NonAttribute<StudyModel>
  declare creator?: NonAttribute<UserModel>
  declare revoker?: NonAttribute<UserModel>
  declare sender?: NonAttribute<UserModel>
  declare consumer?: NonAttribute<UserModel>
}

export class SettingsModel extends Model<InferAttributes<SettingsModel>, InferCreationAttributes<SettingsModel>> {
  declare id: EnumDataType<SettingEnum>
  declare value: string
  declare editor_id: ForeignKey<UserModel['id']>
}

export class DataSourceModel extends Model<InferAttributes<DataSourceModel>, InferCreationAttributes<DataSourceModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare name: string
}

export class DataSourceCoordinatorModel extends Model<InferAttributes<DataSourceCoordinatorModel>, InferCreationAttributes<DataSourceCoordinatorModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare coordinator_id: ForeignKey<CoordinatorModel['id']>
  declare data_source_id: ForeignKey<DataSourceModel['id']>
}

export class DataSourceInvitationModel extends Model<InferAttributes<DataSourceInvitationModel>, InferCreationAttributes<DataSourceInvitationModel>> {
  declare id: CreationOptional<typeof DataTypes.UUID>
  declare invitation_id: ForeignKey<InvitationModel['id']>
  declare data_source_id: ForeignKey<DataSourceModel['id']>
}
