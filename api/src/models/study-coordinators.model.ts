import { DataTypes } from 'sequelize'

import { StudyCoordinatorModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'


function createModel (app: Application): ModelStatic<StudyCoordinatorModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const studyCoordinators = <ModelStatic<StudyCoordinatorModel>>sequelizeClient.define('study_coordinators', {
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
        model: 'coordinators',
        key: 'id'
      }
    },
  }, {})

  studyCoordinators.associate = function(models) {
    const { studies, coordinators } = models

    studyCoordinators.belongsTo(coordinators, {
      foreignKey: 'member_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    studyCoordinators.belongsTo(studies, {
      foreignKey: 'study_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }
  return studyCoordinators
}

export default createModel
