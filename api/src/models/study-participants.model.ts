import { DataTypes } from 'sequelize'

import { StudyParticipantModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'


function createModel (app: Application): ModelStatic<StudyParticipantModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const studyParticipants = <ModelStatic<StudyParticipantModel>>sequelizeClient.define('study_participants', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    study_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'studies',
        key: 'id'
      }
      
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'participants',
        key: 'id'
      }
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_is_validated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {})

  studyParticipants.associate = function(models) {
    const { studies, participants } = models

    studyParticipants.belongsTo(participants, {
      foreignKey: 'member_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    studyParticipants.belongsTo(studies, {
      foreignKey: 'study_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }
  return studyParticipants
}

export default createModel
