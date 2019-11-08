const fs = require('fs');
const path = require('path');
const csvParser = require('csv-js');
const { User } = require('../models');

function handleData(data) {
    csvParser.parse(data.toString()).forEach(async line => {
        if (line.length < 3) {
            return;
        }
        const id = ('' + line[0]).trim().toLowerCase();
        const name = ('' + line[1]).trim();
        const institute = ('' + line[2]).trim();
        await User.create({
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
}
setupData('students', handleData);
