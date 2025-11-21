import { DataTypes } from 'sequelize'

import { SettingsModel } from './declarations'
import { SettingEnum } from './settings.enum'

import type { Application, ModelStatic } from '../declarations'

function createModel(app: Application): ModelStatic<SettingsModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const settings = <ModelStatic<SettingsModel>> sequelizeClient.define('settings', {
    id: {
      type: DataTypes.ENUM({ values: Object.values(SettingEnum) }),
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    editor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {})

  // eslint-disable-next-line no-unused-vars
  settings.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/

    const { users } = models

    settings.belongsTo(users, {
      foreignKey: 'editor_id',
      onDelete: 'cascade'
    })
  }

  return settings
}

export default createModel
