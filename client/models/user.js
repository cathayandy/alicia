import { routerRedux } from 'dva/router';
import request from '../utils/request';

async function getById() {
    const id = localStorage.getItem('id');
    if (!id) {
        return Promise.reject('Not login');
    }
    return request(`/api/users/${encodeURIComponent(id)}`);
}

async function updateInfo(params) {
    const id = localStorage.getItem('id');
    if (!id) {
        return Promise.reject('Not login');
    }
    const body = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    return request(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
    });
}

const initState = {
    userLoading: false,
    updateLoading: false,
    verificationError: null,
    info: {
        studentId: '',
        name: '',
        passed: false,
        review: null,
    },
};

export default {
    namespace: 'user',
    state: { ...initState },
    subscriptions: {
        setupHistory({ dispatch, history }) {
            history.listen(({ pathname }) => {
                if (pathname === '/account') {
                    dispatch({
                        type: 'getById',
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
        *getById(_, { call, put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { userLoading: true } });
            try {
                const { data, err } = yield call(getById);
                if (!err && data.success) {
                    yield put({
                        type: 'save',
                        payload: {
                            info: {
                                ...data.result
                            },    
                        },
                    });
                    if (!data.result.studentId)
                        yield put(routerRedux.push('/verification'));
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { userLoading: false } });
        },
        *updateInfo({ payload }, { call, put: _put }) {
            const put = _put.resolve;
            yield put({
                type: 'save',
                payload: {
                    updateLoading: true,
                    verificationError: null,
                },
            });
            try {
                const { data, err } = yield call(updateInfo, payload);
                if (!err && data.success) {
                    yield put({
                        type: 'save',
                        payload: {
                            info: {
                                ...data.result
                            },    
                        },
                    });
                } else {
                    let info;
                    if (err) {
                        info = err.info || err;
                    } else if (data && !data.success && data.info) {
                        info = data.info;
                    }
                    yield put({
                        type: 'save',
                        payload: { verificationError: info },
                    });
                    console.error(info);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { updateLoading: false } });
            yield put(routerRedux.push({ pathname: '/account' }));
        },
        *logout(_, { put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: initState });
            yield put({ type: 'auth/logout' });
        },
    },
};
