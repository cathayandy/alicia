const Koa = require('koa');
const cors = require('kcors');
const serve = require('koa-static');
const route = require('koa-route');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const { historyApiFallback } = require('koa2-connect-history-api-fallback');
const jwt = require('koa-jwt');
const multer = require('koa-multer');
require('isomorphic-fetch');

const auth = require('./services/auth');
const user = require('./services/user');

// config
const config = require('./config.json');

// setup app
const app = new Koa();
// cors
app.use(cors());
// bodyParser
app.use(bodyParser());
// logger
app.use(logger());
// public routes
// static
app.use(async (ctx, next) => {
    if (ctx.request.path.startsWith('/api')) {
        await next();
    } else {
        await historyApiFallback({})(ctx, next);
    }
});
app.use(async (ctx, next) => {
    if (ctx.request.path.startsWith('/api')) {
        await next();
    } else {
        await serve('./dist', {
            maxage: config.staticExp,
        })(ctx, next);
    }
});
app.use(async (ctx, next) => {
    if (ctx.request.path.startsWith('/api')) {
        await next();
    } else {
        await serve('./server/uploads/', {
            maxage: config.staticExp,
        })(ctx, next);
    }
});
// auth
app.use(auth.errWrapper);
app.use(route.post('/api/login', auth.login));
// private guard
app.use(jwt({ secret: config.jwt.secret, key: 'jwtdata' }));
// private routes
app.use(route.post('/api/verify', auth.verify));
app.use(route.get('/api/users/:id', user.getById));
app.use(route.patch('/api/users/:id', user.updateInfo));
// upload
const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, './server/uploads/');
    },
    filename(_req, file, cb) {
        console.log(file);
        cb(null, `${file.fieldname}`);
    },
});
const upload = multer({ storage });
app.use(route.post('/api/upload/cert', async ctx => {
    await upload.single(`cert.${ctx.state.jwtdata.id}`)(ctx);
    ctx.body = {
        success: true,
    };
}));
// admin guard
app.use(auth.checkAdmin);
// admin routes
app.use(route.get('/api/users', user.getList));
app.use(route.post('/api/users/permission', user.batchPermit));
app.use(route.post('/api/users/:id/permission', user.permit));
app.use(route.delete('/api/users/:id/permission', user.reject));
app.use(route.post('/api/users/:id/review', user.review));
// response
app.listen(config.port);
