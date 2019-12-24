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

export default {
    namespace: 'user',
    state: {
        userLoading: false,
        updateLoading: false,
        info: {
            id: '',
            name: '',
            passed: false,
        },
    },
    subscriptions: {
        setupHistory({ dispatch, history }) {
            history.listen(() => {
                dispatch({
                    type: 'getById',
                });
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
            yield put({ type: 'save', payload: { updateLoading: true } });
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
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { updateLoading: false } });
            yield put(routerRedux.push({ pathname: '/account' }));
        },
    },
};
