import { DataTypes } from 'sequelize'

import { FormResponsesModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'


function createModel(app: Application): ModelStatic<FormResponsesModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const formResponses = <ModelStatic<FormResponsesModel>> sequelizeClient.define('form_responses', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    form_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'forms',
        key: 'id'
      },
      unique: 'form_participant_unique'
    },
    participant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'participants',
        key: 'id'
      },
      unique: 'form_participant_unique'
    },
    is_complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    responses: {
      type: DataTypes.JSON,
      allowNull: false
    },
    furthest_page: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {})

  formResponses.associate = function(models) {
    const { participants, forms } = models

    formResponses.belongsTo(participants, {
      foreignKey: 'participant_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    formResponses.belongsTo(forms, {
      foreignKey: 'form_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

  }
  return formResponses
}

export default createModel
