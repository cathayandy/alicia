const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config.json');
const { database, username, password, options } = config.db;
const sequelize = new Sequelize(database, username, password, options);
const models = { sequelize, Sequelize };
fs
    .readdirSync(__dirname)
    .filter(file =>
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file.slice(-3) === '.js'
    )
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        models[model.name] = model;
    });

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});
sequelize.sync();
module.exports = models;
