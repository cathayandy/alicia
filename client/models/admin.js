import request from '../utils/request';

const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
};

async function review(params) {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    if (params.id === undefined) {
        return Promise.reject('UserId is required');
    }
    const body = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    return request(`/api/users/${encodeURIComponent(params.id)}/review`, {
        method: 'POST',
        body, headers,
    });
}

async function permit(params) {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    if (params.id === undefined) {
        return Promise.reject('UserId is required');
    }
    const body = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    return request(`/api/users/${encodeURIComponent(params.id)}/permission`, {
        method: 'POST',
        body, headers,
    });
}

async function reject(params) {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    if (params.id === undefined) {
        return Promise.reject('UserId is required');
    }
    const body = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    return request(`/api/users/${encodeURIComponent(params.id)}/permission`, {
        method: 'DELETE',
        body, headers,
    });
}

async function batchPermit(idList) {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    const body = idList.map(id => `id=${id}`).join('&');
    return request(`/api/users/permission`, {
        method: 'POST',
        body, headers,
    });
}

async function getUserList() {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    return request('/api/users');
}

export default {
    namespace: 'admin',
    state: {
        permitLoading: new Set(),
        reviewLoading: new Set(),
        listLoading: false,
        users: [],
        selected: new Set(),
    },
    subscriptions: {
        setupHistory({ dispatch, history }) {
            history.listen(() => {
                dispatch({
                    type: 'getUserList',
                });
            });
        },
    },
    reducers: {
        save(state, { payload }) {
            return { ...state, ...payload };
        },
        addSet(state, { payload: { setName, el } }) {
            state[setName].add(el);
            return { ...state };
        },
        delSet(state, { payload: { setName, el } }) {
            state[setName].delete(el);
            return { ...state };
        },
        select(state, { payload: { list } }) {
            list.forEach(i => state.selected.add(i));
            return { ...state };
        },
        unselect(state, { payload: { list } }) {
            list.forEach(i => state.selected.delete(i));
            return { ...state };
        },
    },
    effects: {
        *getUserList(_, { call, put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { listLoading: true } });
            try {
                const { data, err } = yield call(getUserList);
                if (!err && data.success) {
                    yield put({
                        type: 'save',
                        payload: {
                            users: data.result.list,    
                        },
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { listLoading: false } });
        },
        *permit({ payload }, { call, put: _put }) {
            if (payload.id === undefined) {
                console.error('UserId is required');
                return;
            }
            const put = _put.resolve;
            yield put({
                type: 'addSet',
                payload: {
                    setName: 'permitLoading',
                    el: payload.id,
                },
            });
            try {
                const { data, err } = yield call(permit, payload);
                if (!err && data.success) {
                    yield put({
                        type: 'getUserList',
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({
                type: 'delSet',
                payload: {
                    setName: 'permitLoading',
                    el: payload.id,
                },
            });
        },
        *reject({ payload }, { call, put: _put }) {
            if (payload.id === undefined) {
                console.error('UserId is required');
                return;
            }
            const put = _put.resolve;
            yield put({
                type: 'addSet',
                payload: {
                    setName: 'permitLoading',
                    el: payload.id,
                },
            });
            try {
                const { data, err } = yield call(reject, payload);
                if (!err && data.success) {
                    yield put({
                        type: 'getUserList',
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({
                type: 'delSet',
                payload: {
                    setName: 'permitLoading',
                    el: payload.id,
                },
            });
        },
        *batchPermit(_, { call, put: _put, select }) {
            const put = _put.resolve;
            const idSet = yield select(state => state.admin.selected);
            const idList = [...idSet.values()];
            yield put({ type: 'save', payload: { listLoading: true } });
            try {
                const { data, err } = yield call(batchPermit, idList);
                if (!err && data.success) {
                    yield put({
                        type: 'getUserList',
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { listLoading: false } });
        },
        *review({ payload }, { call, put: _put }) {
            if (payload.id === undefined) {
                console.error('UserId is required');
                return;
            }
            const put = _put.resolve;
            yield put({
                type: 'addSet',
                payload: {
                    setName: 'reviewLoading',
                    el: payload.id,
                },
            });
            try {
                const { data, err } = yield call(review, payload);
                if (!err && data.success) {
                    yield put({
                        type: 'getUserList',
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({
                type: 'delSet',
                payload: {
                    setName: 'reviewLoading',
                    el: payload.id,
                },
            });
        },
    },
};
