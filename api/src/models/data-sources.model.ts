import { DataTypes } from 'sequelize'

import { DataSourceModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'

function createModel (app: Application): ModelStatic<DataSourceModel> {
  const sequelizeClient = app.get('sequelizeClient');
  const dataSources = <ModelStatic<DataSourceModel>>sequelizeClient.define('data_sources', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  // eslint-disable-next-line no-unused-vars
  dataSources.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    
    const { participants, coordinators, invitations } = models

    dataSources.belongsToMany(coordinators, {
      through: models['data_source_coordinators'],
      onUpdate: 'cascade',
      onDelete: 'cascade',
      foreignKey: 'data_source_id',
      sourceKey: 'id',
    })

    dataSources.hasOne(participants, {
      foreignKey: 'data_source_id',
      sourceKey: 'id',
      onUpdate: 'cascade',
      onDelete: 'cascade',
    })

    dataSources.belongsToMany(invitations, {
      through: models['data_source_invitations'],
      foreignKey: 'data_source_id',
      onUpdate: 'cascade',
      onDelete: 'cascade',
      sourceKey: 'id'
    })

  };

  return dataSources;
};

export default createModel
