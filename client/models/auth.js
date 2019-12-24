import { routerRedux } from 'dva/router';
import { message } from 'antd';
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

async function login({ id, name }) {
    return request('/api/login', {
        method: 'POST',
        body: `id=${id}&name=${name}`,
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

export default {
    namespace: 'auth',
    state: {
        loading: false,
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
            yield put({ type: 'save', payload: { loading: true } });
            const { data, err } = yield call(verify);
            yield put({ type: 'save', payload: { loading: false } });
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
            yield put({ type: 'save', payload: { loading: true } });
            const { data, err } = yield call(login, payload);
            yield put({ type: 'save', payload: { loading: false } });
            if (!err && data.success) {
                const { id, token, role } = data;
                localStorage.setItem('id', id);
                localStorage.setItem('token', token);
                if (role === 'admin')
                    yield put(routerRedux.push('/admin'));
                else
                    yield put(routerRedux.push('/account'));
            } else {
                message.error('Login failed');
                if (err) {
                    console.error(err);
                }
            }
        },
        *logout(_, { put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { loading: true } });
            localStorage.removeItem('id');
            localStorage.removeItem('token');
            yield put({ type: 'save', payload: { loading: false } });
            yield put(routerRedux.push('/login'));
        },
    },
};
