import { routerRedux } from 'dva/router';
import request from '../utils/request';

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

function login({ id, name }) {
    return request('/api/login', {
        method: 'POST',
        body: `id=${id}&name=${name}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
    });
}
function verify() {
    return request('/api/verify', {
        method: 'POST',
    });
}

export default {
    namespace: 'auth',
    state: {
        loginLoading: false,
        verifyLoading: false,
        loginError: null,
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
    },
};
