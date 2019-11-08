module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        institute: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        reason: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        cert: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        passed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        review: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }, {
        indexes: [{
            unique: true,
            fields: ['id'],
        }],
    });
    return User;
};
