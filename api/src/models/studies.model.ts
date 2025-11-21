import { DataTypes } from 'sequelize'

import { StudyModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'

function createModel(app: Application): ModelStatic<StudyModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const studies = <ModelStatic<StudyModel>> sequelizeClient.define('studies', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    external_study_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000), //TODO: find out actual character limit
      allowNull: true
    },
    stage: {
      type: DataTypes.STRING,
      validate: {
        isIn: [[
          'recruiting',
          'active',
          'invitation',
          'withdrawn',
          'completed',
          'hold'
        ]]
      },
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phase: {
      type: DataTypes.STRING,
      allowNull: false
    },
    linkId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    }
  }, {})

  // eslint-disable-next-line no-unused-vars
  studies.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/

    const { participants, forms, coordinators, invitations } = models

    studies.belongsToMany(participants, {
      through: models['study_participants'],
      foreignKey: 'study_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    studies.belongsToMany(coordinators, {
      through: models['study_coordinators'],
      foreignKey: 'study_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    studies.hasMany(forms, {
      foreignKey: 'study_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    studies.hasMany(invitations, {
      foreignKey: 'study_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }

  return studies
}

export default createModel
