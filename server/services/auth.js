const jsonwebtoken = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const config = require('../config.json');
const { User } = require('../models');

async function errWrapper(ctx, next) {
    return next().catch(err => {
        if (401 === err.status) {
            ctx.status = 401;
            ctx.body = 'Unauthorized';
        } else {
            throw err;
        }
    });
}

async function login(ctx) {
    const { id, name } = ctx.request.body;
    const user = await User.findOne({
        where: { id },
    });
    if (!user) {
        ctx.body = {
            success: false,
            info: 'Not Found',
        };
        ctx.status = 401;
        return;
    }
    const match = name === user.name; // await bcrypt.compare(password, user.password);
    if (match) {
        const role = config.adminList.find(v => v === id) ?
            'admin' : 'user';
        ctx.body = {
            success: true,
            role,
            id,
            token: jsonwebtoken.sign({
                id,
                exp: Math.floor(Date.now() / 1000) + config.jwt.exp,
            }, config.jwt.secret),
        };
    } else {
        ctx.body = {
            success: false,
            info: 'Not Match',
        };
        ctx.status = 401;
        return;
    }
}

async function verify(ctx, next) {
    try {
        await next();
        ctx.body = {
            success: true,
            role: 'admin',
        };
    } catch (err) {
        if (401 === err.status) {
            const id = ctx.state.jwtdata.id;
            const user = await User.findOne({
                where: { id },
            });
            if (!user) {
                ctx.throw(401);
            }
            ctx.body = {
                success: true,
                role: 'user',
            };
        } else {
            throw err;
        }
    }
}

async function check(ctx, next) {
    if (ctx.state.id === ctx.state.jwtdata.id) {
        await next();
    } else {
        ctx.throw(401);
    }
}

async function checkAdmin(ctx, next) {
    if (config.adminList.find(id => id === ctx.state.jwtdata.id)) {
        await next();
    } else {
        ctx.throw(401);
    }
}

module.exports = {
    errWrapper, login, verify, check, checkAdmin,
};
