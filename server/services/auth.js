const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const config = require('../config.json');
const { sendMail } = require('../lib/smtp');
const { User, Captcha } = require('../models');

const emailReg =
/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function randomStr(len) {
    return Math.random().toString(36).slice(2, len + 2);
}

function isExpired(ts, duration) {
    const now = new Date();
    const delta = now - ts;
    return delta > duration;
}

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
    const { email, password } = ctx.request.body;
    const user = await User.findOne({
        where: { email },
    });
    if (!user) {
        ctx.body = {
            success: false,
            info: 'Not Found',
        };
        ctx.status = 401;
        return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        const role = config.adminList.find(([e, _p]) => e === email) ?
            'admin' : 'user';
        ctx.body = {
            success: true,
            role,
            id: user.id,
            token: jsonwebtoken.sign({
                id: user.id,
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
            const user = await User.findByPk(id);
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

async function sendCaptcha(ctx) {
    const { email } = ctx.request.body;
    // check email
    if (!emailReg.test(email)) {
        ctx.body = {
            success: false,
            info: 'Invalid email address',
        };
        return;
    }
    // check existence
    const user = await User.findOne({
        where: { email },
    });
    if (user) {
        ctx.body = {
            success: false,
            info: 'Email Already Existed',
        };
        return;
    }
    // generate & save captcha
    const captcha = randomStr(6);
    await Captcha.upsert({ email, captcha });
    // send captcha to user
    const mailOptions = {
        from: config.smtp.from,
        to: email,
        subject: '注册验证码',
        html: `您的验证码为: <b>${captcha}</b>`,
    };
    const res = await sendMail(mailOptions, 'captcha');
    if (res) {
        ctx.body = {
            success: true,
        };
    } else {
        ctx.body = {
            success: false,
            info: 'Email Sent Failed',
        };
    }
}

async function register(ctx) {
    const { email, password, captcha } = ctx.request.body;
    // check email
    if (!emailReg.test(email)) {
        ctx.body = {
            success: false,
            info: 'Invalid Email Address',
        };
        return;
    }
    // check captcha
    /*
    const target = await Captcha.findOne({
        where: { email, captcha },
    });
    if (!target || isExpired(target.updatedAt, config.captchaExp)) {
        ctx.body = {
            success: false,
            info: 'Captcha Invalid or Expired',
        };
        return;
    }
    */
    // create user
    const hash = await bcrypt.hash(password, config.bcrypt.round);
    try {
        await User.create({
            email: email.toLowerCase(),
            password: hash,
        });
    } catch (err) {
        if (err instanceof Sequelize.UniqueConstraintError) {
            ctx.body = {
                success: false,
                info: 'Email Already Existed',
            };
            return;
        } else {
            throw(err);
        }
    }
    ctx.body = {
        success: true,
    };
}

async function check(ctx, next) {
    if (ctx.state.id === ctx.state.jwtdata.id) {
        await next();
    } else {
        ctx.throw(401);
    }
}

async function checkAdmin(ctx, next) {
    const user = await User.findByPk(ctx.state.jwtdata.id);
    if (config.adminList.find(([e, _p]) => e === user.email)) {
        await next();
    } else {
        ctx.throw(401);
    }
}

module.exports = {
    errWrapper, login, verify, check, checkAdmin, sendCaptcha, register,
};
