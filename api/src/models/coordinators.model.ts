import { DataTypes } from 'sequelize'

import { CoordinatorModel } from './declarations'

import type { Application, ModelStatic } from '../declarations'

function createModel (app: Application): ModelStatic<CoordinatorModel> {
  const sequelizeClient = app.get('sequelizeClient');
  const coordinators = <ModelStatic<CoordinatorModel>>sequelizeClient.define('coordinators', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    name_prefix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: { // TODO: This should probably be on the coordinator_study table
      type: DataTypes.STRING,
      allowNull: true
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    registered: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {});

  // eslint-disable-next-line no-unused-vars
  coordinators.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    
    const { users, studies, data_sources } = models

    coordinators.belongsToMany(studies, {
      through: models['study_coordinators'],
      onUpdate: 'cascade',
      onDelete: 'cascade',
      foreignKey: 'member_id',
      sourceKey: 'id',
    })

    coordinators.belongsTo(users, {
      foreignKey: 'user_id',
      onUpdate: 'cascade',
      onDelete: 'cascade',
    })

    coordinators.belongsToMany(data_sources, {
      through: models['data_source_coordinators'],
      onUpdate: 'cascade',
      onDelete: 'cascade',
      foreignKey: 'coordinator_id',
      sourceKey: 'id',
    })

  };

  return coordinators;
};

export default createModel
