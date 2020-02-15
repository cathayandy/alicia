const bcrypt = require('bcrypt');
const config = require('../config');
const { User } = require('../models');

function setupData() {
    config.adminList.forEach(async ([email, pass]) => {
        const hash = await bcrypt.hash(pass, config.bcrypt.round);
        await User.upsert({ email: email.toLowerCase(), password: hash });
    });
}
setupData();
