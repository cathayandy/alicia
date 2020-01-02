module.exports = (sequelize, Sequelize) => {
    const Captcha = sequelize.define('Captcha', {
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true,
            },
            primaryKey: true,
        },
        captcha: {
            type: Sequelize.STRING,
        },
    });
    return Captcha;
}
