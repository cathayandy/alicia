module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.STRING(50),
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        institute: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        phone: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        reason: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        score: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        cert: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        passed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        review: {
            type: Sequelize.TEXT,
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
