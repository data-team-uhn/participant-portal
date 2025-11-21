// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes } from 'sequelize'

import { UserModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'
import { RoleEnum } from './roles.enum'


function createModel (app: Application): ModelStatic<UserModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const users = <ModelStatic<UserModel>>sequelizeClient.define('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(RoleEnum)), // Use the enum values
      allowNull: false,
      defaultValue: RoleEnum.PARTICIPANT
    },
    locale: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'en',
      validate: {
        isIn: [ [
          'en',
          'fr'
        ] ]
      },
    },
    subscribed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // feathers-auth-mgmt fields below
    // https://feathers-a-m.netlify.app/getting-started.html#extension-of-the-users-model
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    verifyToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verifyExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {})

  users.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    const { coordinators, messages, participants, invitations, forms, settings } = models

    users.hasMany(messages, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasMany(messages, {
      foreignKey: 'triggered_by',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasOne(participants, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasOne(coordinators, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasMany(forms, {
      foreignKey: 'created_by',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasMany(invitations, {
      foreignKey: 'created_by',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasMany(invitations, {
      foreignKey: 'revoked_by',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasMany(invitations, {
      foreignKey: 'consumed_by',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    users.hasMany(settings, {
      foreignKey: 'editor_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }

  return users
}

export default createModel
