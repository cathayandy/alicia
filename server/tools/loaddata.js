const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const csvParser = require('csv-js');
const config = require('../config');
const { Student, User } = require('../models');

function handleData(data) {
    csvParser.parse(data.toString()).forEach(async line => {
        if (line.length < 5) {
            return;
        }
        const id = ('' + line[0]).trim().toLowerCase();
        const name = ('' + line[1]).trim();
        const institute = ('' + line[3]).trim();
        await Student.create({
            id, name, institute,
        });
    });
}
function loadData(file, handler) {
    console.log(`Loading data...`);
    fs.readFile(file, (err, data) => {
        if (err) {
            console.error(`Data loading failed!`);
            console.error(err);
        } else {
            handler(data);
        }
    });
}
function setupData(title, handler) {
    const file = path.resolve(__dirname, '..', `${title}.csv`);
    loadData(file, handler);
    config.adminList.forEach(async admin => {
        const hash = await bcrypt.hash('123456', config.bcrypt.round);
        await User.create({ email: admin.toLowerCase(), password: hash });
    });
}
setupData('students', handleData);
