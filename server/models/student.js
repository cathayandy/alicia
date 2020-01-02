module.exports = (sequelize, Sequelize) => {
    const Student = sequelize.define('Student', {
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
    }, {
        indexes: [{
            unique: true,
            fields: ['id'],
        }],
    });
    return Student;
};
