module.exports = (sequelize, Sequelize) => {
    const Captcha = sequelize.define('Captcha', {
        email: {
            type: Sequelize.STRING(100),
            validate: {
                isEmail: true,
            },
            primaryKey: true,
        },
        captcha: {
            type: Sequelize.STRING(100),
        },
    });
    return Captcha;
}
