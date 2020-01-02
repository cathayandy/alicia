module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        email: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        studentId: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        institute: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        phone: {
            type: Sequelize.STRING(50),
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
        lastUpdated: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        lastReviewed: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    }, {
        indexes: [{
            unique: true,
            fields: ['email'],
        }],
    });
    return User;
};
