import { DataTypes } from 'sequelize'

import { DataSourceInvitationModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'

function createModel (app: Application): ModelStatic<DataSourceInvitationModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const dataSourceInvitations = <ModelStatic<DataSourceInvitationModel>>sequelizeClient.define('data_source_invitations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    data_source_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'data_sources',
        key: 'id'
      }
      
    },
    invitation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'invitations',
        key: 'id'
      }
    },
  }, {})

  dataSourceInvitations.associate = function(models) {
    const { data_sources, invitations } = models

    dataSourceInvitations.belongsTo(invitations, {
      foreignKey: 'invitation_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    dataSourceInvitations.belongsTo(data_sources, {
      foreignKey: 'data_source_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }
  return dataSourceInvitations
}

export default createModel
