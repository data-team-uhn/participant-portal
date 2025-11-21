import { DataTypes } from 'sequelize'

import { InvitationModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'
import { RoleEnum } from './roles.enum'


function createModel(app: Application): ModelStatic<InvitationModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const invitations = <ModelStatic<InvitationModel>> sequelizeClient.define('invitations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM({ values: Object.values(RoleEnum) }),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    study_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'studies',
        key: 'id'
      },
      unique: 'study_id_recipient_unique'
    },
    recipient: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'study_id_recipient_unique'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    revoked_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    revoked_at: {
      type: DataTypes.DATE
    },
    consumed_at: {
      type: DataTypes.DATE
    },
    consumed_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {})

  invitations.associate = function(models) {
    const { users, studies, data_sources, data_source_invitations } = models

    invitations.belongsTo(users, {
      foreignKey: 'created_by',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    invitations.belongsTo(users, {
      foreignKey: 'revoked_by',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    invitations.belongsTo(users, {
      foreignKey: 'consumed_by',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    invitations.belongsTo(studies, {
      foreignKey: 'study_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    invitations.belongsToMany(data_sources, {
      through: data_source_invitations,
      foreignKey: 'invitation_id',
      onUpdate: 'cascade',
      onDelete: 'cascade',
      sourceKey: 'id'
    })
  }


  return invitations
}

export default createModel
