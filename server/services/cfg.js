const fs = require('fs');
const path = require('path');
const config = require('../config.json');

function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}

async function getAppStatus(ctx) {
    ctx.body = {
        success: true,
        result: config.appStatus,
    };
}

async function openApplication(ctx) {
    const file = path.resolve(__dirname, '..', 'config.json');
    config.appStatus = true;
    await writeFile(file, JSON.stringify(config, null, 4));
    ctx.body = {
        success: true,
    };
}

async function closeApplication(ctx) {
    const file = path.resolve(__dirname, '..', 'config.json');
    config.appStatus = false;
    await writeFile(file, JSON.stringify(config, null, 4));
    ctx.body = {
        success: true,
    };
}


module.exports = {
    openApplication, closeApplication, getAppStatus,
};