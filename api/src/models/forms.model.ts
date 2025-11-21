import { DataTypes } from 'sequelize'

import { FormsModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'
import { FormsTypeEnum } from './formsType.enum'


function createModel(app: Application): ModelStatic<FormsModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const forms = <ModelStatic<FormsModel>> sequelizeClient.define('forms', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_form_version'
    },
    type: {
      type: DataTypes.ENUM({ values: Object.values(FormsTypeEnum) }),
      allowNull: false,
      defaultValue: FormsTypeEnum.MODULE
    },
    study_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'studies',
        key: 'id'
      },
      unique: 'unique_form_version'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      unique: 'unique_form_version'
    },
    form: {
      type: DataTypes.JSON,
      allowNull: false
    },
  }, {})

  forms.associate = function(models) {
    const { studies, form_responses, users } = models

    forms.belongsTo(studies, {
      foreignKey: 'study_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    forms.belongsTo(users, {
      foreignKey: 'created_by',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    forms.hasMany(form_responses, {
      foreignKey: 'form_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

  }
  return forms
}

export default createModel
