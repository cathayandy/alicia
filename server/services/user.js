const config = require('../config.json');
const { User } = require('../models');

async function getList(ctx) {
    const { page=0, size=50 } = ctx.request.query;
    const { rows, count } = await User.findAndCountAll({
        offset: page * size,
        limit: size,
        attributes: [
            'createdAt', 'id', 'name', 'institute', 'phone',
            'email', 'reason', 'cert', 'passed', 'review',
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
        },
    };
}

async function updateInfo(ctx, id) {
    ctx.body = {
        success: true,
        result: {
            id,
        },
    };
}

async function batchPermit(ctx, id) {
    ctx.body = {
        success: true,
        result: {
            id,
        },
    };
}

async function permit(ctx, id) {
    ctx.body = {
        success: true,
        result: {
            id,
        },
    };
}

module.exports = {
    getList, getById, updateInfo, batchPermit, permit,
};
