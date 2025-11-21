import { DataTypes } from 'sequelize'

import { MessageModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'


function createModel (app: Application): ModelStatic<MessageModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const messages = <ModelStatic<MessageModel>>sequelizeClient.define('messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    triggered_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    token: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {})

  messages.associate = function(models) {
    const { users } = models

    messages.belongsTo(users, {
      foreignKey: 'triggered_by',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    messages.belongsTo(users, {
      foreignKey: 'user_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }

  return messages
}

export default createModel
