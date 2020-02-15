const nodemailer = require('nodemailer');
const config = require('../config.json');

const transporter = nodemailer.createTransport(config.smtp);
const taskMap = new Map();

function wait(key, resolve) {
    setTimeout(() => {
        const value = taskMap.get(key);
        if (value === 'SUCCESS' || value === 'FAILED') {
            resolve(value);
        } else {
            wait(key, resolve);
        }
    }, config.mailFreq.interval);
}

async function sendMail(mailOptions, type, retries=config.mailFreq.retries) {
    const key = `${mailOptions.to}:${type}`;
    taskMap.set(key, { mailOptions, retries });
    return await new Promise((resolve, _reject) => {
        wait(key, resolve);
    });
}

async function flush() {
    if (taskMap.size === 0)
        return;
    let count = 0;
    for ([key, value] of taskMap.entries()) {
        if (count >= config.mailFreq.amount)
            break;
        if (value !== 'SUCCESS' && value !== 'FAILED') {
            try {
                await transporter.sendMail(value.mailOptions);
                taskMap.set(key, 'SUCCESS');
                count += 1;
            } catch (_err) {
                if (value.retries <= 0) {
                    taskMap.set(key, 'FAILED');
                } else {
                    taskMap.set(key, { ...value, retries: value.retries - 1});
                }
            }
        }
    }
}

setInterval(flush, config.mailFreq.interval);

module.exports = {
    sendMail,
};
