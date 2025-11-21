import { DataTypes } from 'sequelize'

import { DataSourceCoordinatorModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'


function createModel (app: Application): ModelStatic<DataSourceCoordinatorModel> {
  const sequelizeClient = app.get('sequelizeClient')
  const dataSourceCoordinators = <ModelStatic<DataSourceCoordinatorModel>>sequelizeClient.define('data_source_coordinators', {
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
    coordinator_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'coordinators',
        key: 'id'
      }
    },
  }, {})

  dataSourceCoordinators.associate = function(models) {
    const { data_sources, coordinators } = models

    dataSourceCoordinators.belongsTo(coordinators, {
      foreignKey: 'coordinator_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })

    dataSourceCoordinators.belongsTo(data_sources, {
      foreignKey: 'data_source_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  }
  return dataSourceCoordinators
}

export default createModel
