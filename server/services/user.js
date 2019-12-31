const Sequelize = require('sequelize');
const config = require('../config.json');
const { User } = require('../models');

async function getList(ctx) {
    const { page=1, size=10 } = ctx.request.query;
    const { rows, count } = await User.findAndCountAll({
        offset: (page - 1) * +size,
        limit: +size,
        attributes: [
            'createdAt', 'id', 'name', 'institute', 'phone',
            'email', 'reason', 'score', 'cert', 'passed', 'review',
        ],
    });
    ctx.body = {
        success: true,
        result: {
            list: rows, total: count,
        },
    };
}

async function getById(ctx, id) {
    if (ctx.state.jwtdata.id !== id &&
        !config.adminList.find(id => id === ctx.state.jwtdata.id)) {
        ctx.throw(401);
    }
    const result = await User.findByPk(id);
    ctx.body = {
        success: true,
        result: {
            id: result.id,
            name: result.name,
            passed: result.passed,
            review: result.review,
        },
    };
}

async function updateInfo(ctx, id) {
    if (ctx.state.jwtdata.id !== id) {
        ctx.throw(401);
    }
    const { phone, email, reason, score, cert } = ctx.request.body;
    const user = await User.findByPk(id);
    if (phone !== undefined) {
        user.phone = phone;
    }
    if (email !== undefined) {
        user.email = email;
    }
    if (reason !== undefined) {
        user.reason = reason;
    }
    if (score !== undefined) {
        user.score = score;
    }
    if (cert !== undefined) {
        user.cert = cert;
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

async function permit(ctx, id) {
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

async function reject(ctx, id) {
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

async function review(ctx, id) {
    const { review } = ctx.request.body;
    const user = await User.findByPk(id);
    user.review = review;
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
    const users = await User.findAll({
        attributes: [
            'id', 'name', 'institute', 'phone',
            'email', 'reason', 'score', 'passed',
        ],
    });
    ctx.body = {
        success: true,
        result: {
            list: users,
        },
    };
}

module.exports = {
    getList, getById, updateInfo, batchPermit,
    permit, review, reject, exportList,
};
