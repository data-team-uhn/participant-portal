import { DataTypes } from 'sequelize'

import { ParticipantModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'

function createModel (app: Application): ModelStatic<ParticipantModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const participants = <ModelStatic<ParticipantModel>>sequelizeClient.define('participants', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    external_participant_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mrn: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    registered: {
      type: DataTypes.DATE,
      allowNull: true
    },
    viewed_registry_consent: {
      type: DataTypes.DATE
    },
    contact_permission_confirmed: {
      type: DataTypes.DATE
    },
    data_source_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'data_sources',
        key: 'id'
      }
    }
  }, {})

  // eslint-disable-next-line no-unused-vars
  participants.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/

    const { users, studies, form_responses, data_sources } = models

    participants.belongsToMany(studies, {
      through: models['study_participants'],
      onUpdate: 'cascade',
      onDelete: 'cascade',
      foreignKey: 'member_id',
      sourceKey: 'id',
    })

    participants.belongsTo(users, {
      foreignKey: 'user_id',
      onUpdate: 'cascade',
      onDelete: 'cascade',
    })

    participants.hasMany(form_responses, {
      foreignKey: 'participant_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    participants.belongsTo(data_sources, {
      foreignKey: 'data_source_id',
      onUpdate: 'cascade',
      onDelete: 'cascade',
    })

  }

  return participants
};

export default createModel
