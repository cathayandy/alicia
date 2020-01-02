const nodemailer = require('nodemailer');
const config = require('../config.json');

const transporter = nodemailer.createTransport(config.smtp);

module.exports = {
    transporter,
};
