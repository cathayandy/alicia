const Sequelize = require('sequelize');
const config = require('../config.json');
const smtp = require('../lib/smtp');
const { User, Student } = require('../models');

async function getList(ctx) {
    const { page=1, size=10 } = ctx.request.query;
    const { rows, count } = await User.findAndCountAll({
        offset: (page - 1) * +size,
        limit: +size,
        attributes: [
            'id', 'createdAt', 'studentId', 'name', 'institute', 'phone',
            'email', 'reason', 'score', 'cert', 'passed', 'review',
            'lastUpdated', 'lastReviewed',
        ],
    });
    ctx.body = {
        success: true,
        result: {
            list: rows, total: count,
        },
    };
}

async function getById(ctx, _id) {
    const id = +_id;
    const currentUser = await User.findByPk(ctx.state.jwtdata.id);
    if (ctx.state.jwtdata.id !== id &&
        !config.adminList.find(email => email === currentUser.email)) {
        ctx.throw(401);
    }
    const result = await User.findByPk(id, {
        attributes: [
            'studentId', 'name', 'institute', 'phone',
            'email', 'reason', 'score', 'cert', 'passed',
            'review', 'lastUpdated', 'lastReviewed',
        ],
    });
    ctx.body = {
        success: true,
        result,
    };
}

async function updateInfo(ctx, _id) {
    const id = +_id;
    if (ctx.state.jwtdata.id !== id) {
        ctx.throw(401);
    }
    const user = await User.findByPk(id);
    const { studentId, name } = ctx.request.body;
    if (studentId) {
        const anotherUser = await User.findOne({
            where: { studentId }
        });
        if (anotherUser) {
            ctx.body = {
                success: false,
                info: 'Already Registered',
            };
            return;
        }
        const student = await Student.findByPk(studentId);
        if (!student) {
            ctx.body = {
                success: false,
                info: 'Student Not Found',
            };
            return;
        }
        if (student.name !== name) {
            ctx.body = {
                success: false,
                info: 'Student Not Match',
            };
            return;
        }
        user.studentId = studentId;
        user.name = name;
        user.institute = student.institute;
    } else {
        if (!config.appStatus) {
            ctx.body = {
                success: false,
                info: 'Deadline Passed',
            };
            return;
        }
        const { phone, reason, score, cert } = ctx.request.body;
        let flag = false;
        if (phone !== undefined) {
            user.phone = phone;
            flag = true;
        }
        if (reason !== undefined) {
            user.reason = reason;
            flag = true;
        }
        if (score !== undefined) {
            user.score = score;
            flag = true;
        }
        if (cert !== undefined) {
            user.cert = cert;
            flag = true;
        }
        if (flag) {
            user.lastUpdated = new Date();
        }
    }
    await user.save();
    ctx.body = {
        success: true,
        result: {
            id,
        },
    };
}

async function batchPermit(ctx) {
    const { id: idList } = ctx.request.body;
    await User.update(
        { passed: true },
        { where: { [Sequelize.Op.or]: idList.map(id => ({ id })) }}
    );
    ctx.body = {
        success: true,
        result: {
            idList,
        },
    };
}

async function permit(ctx, _id) {
    const id = +_id;
    const user = await User.findByPk(id);
    user.passed = true;
    await user.save();
    ctx.body = {
        success: true,
        result: {
            id,
        },
    };
}

async function reject(ctx, _id) {
    const id = +_id;
    const user = await User.findByPk(id);
    user.passed = false;
    await user.save();
    ctx.body = {
        success: true,
        result: {
            id,
        },
    };
}

async function review(ctx, _id) {
    const id = +_id;
    const { review } = ctx.request.body;
    const user = await User.findByPk(id);
    user.review = review;
    user.lastReviewed = new Date();
    await user.save();
    ctx.body = {
        success: true,
        result: {
            id,
            review,
        },
    };
}

async function exportList(ctx) {
    const where = {
        lastUpdated: {
            [Sequelize.Op.ne]: null,
        },
    };
    if (ctx.request.body.passed === 'true') {
        where.passed = true;
    } else if (ctx.request.body.passed === 'false') {
        where.passed = false;
    }
    const users = await User.findAll({
        where,
        attributes: [
            'name', 'studentId', 'institute', 'phone',
            'email', 'reason', 'score', 'passed', 'review',
        ],
    });
    ctx.body = {
        success: true,
        result: {
            list: users.map(({
                name, studentId, institute, phone,
                email, reason, score, passed, review,
            }) => [
                name, studentId, institute, phone,
                email, reason, score, passed, review,
            ]),
        },
    };
}

const reviewMap = {
    'file-broken': '证明文件损坏/无法打开',
    'file-blur': '证明文件模糊/无法辨认',
    'unmatch': '免修类别与证明文件不符',
    // 'disqualified': '未达到要求',
    // 'invalid-phone': '手机无法接通',
};

async function noticeAll(ctx) {
    const users = await User.findAll({
        where: {
            lastUpdated: {
                [Sequelize.Op.ne]: null,
            },
        },
        attributes: [
            'email', 'passed', 'review',
        ],
    });
    for ({ email, passed, review } of users) {
        if (passed) {
            const mailOptions = {
                from: config.smtp.from,
                to: email,
                subject: '免修申请平台',
                html: '恭喜，您的免修申请已通过。',
            };
            await smtp.transporter.sendMail(mailOptions);
        } else {
            const hint = review ?
                `原因为：${reviewMap[review] || review}` : '';
            const mailOptions = {
                from: config.smtp.from,
                to: email,
                subject: '免修申请平台',
                html: `抱歉，您的免修申请未通过。${hint}`,
            };
            await smtp.transporter.sendMail(mailOptions);
        }
    }
    ctx.body = {
        success: true,
        result: {
            list: users,
        },
    };
}

module.exports = {
    getList, getById, updateInfo, batchPermit,
    permit, review, reject, exportList, noticeAll,
};
