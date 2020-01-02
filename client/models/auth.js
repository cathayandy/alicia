import { routerRedux } from 'dva/router';
import request from '../utils/request';
import { sleep } from '../utils';

const enterRoutes = [/^\/login/];
const adminRoutes = [/^\/admin/];
const userRoutes = [/^\/account/, /^\/application/];

function testEnter(route) {
    return enterRoutes.reduce((prev, cur) => prev || cur.test(route), false);
}
function testAdmin(route) {
    return adminRoutes.reduce((prev, cur) => prev || cur.test(route), false);
}
function testUser(route) {
    return userRoutes.reduce((prev, cur) => prev || cur.test(route), false);
}

function login({ email, password }) {
    return request('/api/login', {
        method: 'POST',
        body: `email=${email}&password=${password}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
    });
}
async function verify() {
    return request('/api/verify', {
        method: 'POST',
    });
}
async function register({ email, password, captcha }) {
    return request('/api/register', {
        method: 'POST',
        body: `email=${email}&password=${password}&captcha=${captcha}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
    });
}
async function sendCaptcha({ email }) {
    return request('/api/captcha', {
        method: 'POST',
        body: `email=${email}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
    });
}

export default {
    namespace: 'auth',
    state: {
        loginLoading: false,
        verifyLoading: false,
        captchaLoading: false,
        registerLoading: false,
        loginError: null,
        registerError: null,
        remaining: 0,
    },
    subscriptions: {
        setupHistory({ dispatch, history }) {
            history.listen(({ pathname }) => {
                if (testAdmin(pathname) ||
                    testUser(pathname) ||
                    testEnter(pathname)) {
                    dispatch({
                        type: 'verify',
                        payload: {
                            pathname,
                        },
                    });
                }
            });
        },
    },
    reducers: {
        save(state, { payload }) {
            return { ...state, ...payload };
        },
    },
    effects: {
        *verify({ payload }, { call, put: _put }) {
            const put = _put.resolve;
            const { pathname } = payload;
            yield put({ type: 'save', payload: { verifyLoading: true } });
            const { data, err } = yield call(verify);
            yield put({ type: 'save', payload: { verifyLoading: false } });
            if (!err && data.success && data.role === 'admin') {
                if (testEnter(pathname)) {
                    yield put(routerRedux.push('/admin'));
                }
            } else if (!err && data.success && data.role === 'user') {
                if (testEnter(pathname) || testAdmin(pathname)) {
                    yield put(routerRedux.push('/account'));
                }
            } else if (testAdmin(pathname) || testUser(pathname)) {
                yield put(routerRedux.push({
                    pathname: '/login',
                }));
            }
            if (err) {
                console.error(err);
            }
        },
        *login({ payload }, { call, put: _put }) {
            const put = _put.resolve;
            yield put({
                type: 'save',
                payload: {
                    loginLoading: true,
                    loginError: null,
                },
            });
            const { data, err } = yield call(login, payload);
            yield put({ type: 'save', payload: { loginLoading: false } });
            if (!err && data.success) {
                const { id, token, role } = data;
                localStorage.setItem('id', id);
                localStorage.setItem('token', token);
                if (role === 'admin')
                    yield put(routerRedux.push('/admin'));
                else
                    yield put(routerRedux.push('/account'));
            } else {
                let info;
                if (err) {
                    info = err.info || err;
                } else if (data && !data.success && data.info) {
                    info = data.info;
                }
                yield put({
                    type: 'save',
                    payload: { loginError: info },
                });
                console.error(info);
            }
        },
        *logout(_, { put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { loginLoading: true } });
            localStorage.removeItem('id');
            localStorage.removeItem('token');
            yield put({ type: 'save', payload: { loginLoading: false } });
            yield put(routerRedux.push('/login'));
        },
        *register({ payload }, { put: _put, call }) {
            const put = _put.resolve;
            yield put({
                type: 'save',
                payload: {
                    registerLoading: true,
                    registerError: null,
                },
            });
            const { data, err } = yield call(register, payload);
            yield put({ type: 'save', payload: { registerLoading: false } });
            if (!err && data.success) {
                yield put({
                    type: 'save',
                    payload: {
                        loginError: null,
                    },
                });
                yield put(routerRedux.push('/login'));
            } else {
                let info;
                if (err) {
                    info = err.info || err;
                } else if (data && !data.success && data.info) {
                    info = data.info;
                }
                yield put({
                    type: 'save',
                    payload: { registerError: info },
                });
                console.error(info);
            }
        },
        *sendCaptcha({ payload }, { put: _put, call }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { captchaLoading: true } });
            const { data, err } = yield call(sendCaptcha, payload);
            yield put({ type: 'save', payload: { captchaLoading: false }});
            if (!err && data.success) {
                yield put({
                    type: 'countdown',
                    payload: { remaining: 60 },
                });
            } else {
                let info;
                if (err) {
                    info = err.info || err;
                } else if (data && !data.success && data.info) {
                    info = data.info;
                }
                console.error(info);
            }
        },
        *sleep({ payload: { time } }, { call }) {
            yield call(sleep, time);
        },
        *countdown({ payload: { remaining } }, { put: _put }) {
            const put = _put.resolve;
            yield put({
                type: 'save',
                payload: {
                    remaining,
                }
            });
            if (remaining > 0) {
                yield put({
                    type: 'sleep',
                    payload: { time: 1000 },
                });
                yield put({
                    type: 'countdown',
                    payload: { remaining: remaining - 1 },
                });
            }
        }
    },
};
