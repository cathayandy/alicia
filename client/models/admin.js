import request from '../utils/request';
import { certTypeMap, reviewMap, fileDownload } from '../utils';
import { message } from 'antd';

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

async function noticeAll() {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    return request(`/api/users/notice`, {
        method: 'POST',
        headers,
    });
}

async function exportList(params) {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    const body = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    return request(`/api/users/export`, {
        method: 'POST',
        headers,
        body,
    });
}

async function getAppStatus() {
    return request(`/api/cfg/application`, {
        method: 'GET',
        headers,
    });
}

async function openApplication() {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    return request(`/api/cfg/application`, {
        method: 'PUT',
        headers,
    });
}

async function closeApplication() {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    return request(`/api/cfg/application`, {
        method: 'DELETE',
        headers,
    });
}

async function getUserList({
    pagination: { pageSize=10, current=0 },
    filteredValue: { passed=null },
}) {
    const adminId = localStorage.getItem('id');
    if (!adminId) {
        return Promise.reject('Not login');
    }
    let url = `/api/users?size=${pageSize}&page=${current}`;
    if (Array.isArray(passed) && passed.length === 1) {
        url += `&passed=${passed[0]}`;
    }
    return request(url);
}

export default {
    namespace: 'admin',
    state: {
        permitLoading: new Set(),
        reviewLoading: new Set(),
        noticeLoading: false,
        exportLoading: false,
        listLoading: false,
        appStatus: true,
        users: [],
        pagination: {
            pageSize: 10,
            current: 1,
        },
        filteredValue: {},
        selected: new Set(),
    },
    subscriptions: {
        setupHistory({ dispatch, history }) {
            history.listen(({ search }) => {
                let current = 1;
                let passed = null;
                if (search.length > 0) {
                    const arr = search.split('?');
                    if (arr.length > 1) {
                        const q = arr[1].split('&').map(q => q.split('='));
                        const pageQuery = q.find(([k, _v]) => k === 'page');
                        if (pageQuery) {
                            current = +pageQuery[1];
                        }
                        const passedQuery = q.find(([k, _v]) => k === 'passed');
                        if (passedQuery) {
                            if (passedQuery[1] === 'true')
                                passed = true;
                            else if (passedQuery[1] === 'false')
                                passed = false;
                        }
                    }
                }
                const payload = {
                    pagination: {
                        pageSize: 10,
                        current,
                    },
                    filteredValue: {},
                };
                if (passed !== null) {
                    payload.filteredValue = {
                        passed: [passed],
                    };
                }
                dispatch({
                    type: 'getUserList',
                    payload,
                });
                dispatch({
                    type: 'getAppStatus',
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
        *getUserList({ payload }, { call, put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { listLoading: true } });
            try {
                const { data, err } = yield call(getUserList, payload);
                if (!err && data.success) {
                    yield put({
                        type: 'save',
                        payload: {
                            users: data.result.list,    
                            pagination: {
                                ...payload.pagination,
                                total: data.result.total,
                            },
                            filteredValue: {
                                ...payload.filteredValue,
                            }
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
        *permit({ payload }, { call, put: _put, select }) {
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
                    const pagination = yield select(
                        state => state.admin.pagination
                    );
                    const filteredValue = yield select(
                        state => state.admin.filteredValue
                    );
                    yield put({
                        type: 'getUserList',
                        payload: { pagination, filteredValue },
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
        *reject({ payload }, { call, put: _put, select }) {
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
                    const pagination = yield select(
                        state => state.admin.pagination
                    );
                    const filteredValue = yield select(
                        state => state.admin.filteredValue
                    );
                    yield put({
                        type: 'getUserList',
                        payload: { pagination, filteredValue },
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
                    const pagination = yield select(
                        state => state.admin.pagination
                    );
                    const filteredValue = yield select(
                        state => state.admin.filteredValue
                    );
                    yield put({
                        type: 'getUserList',
                        payload: { pagination, filteredValue },
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { listLoading: false } });
        },
        *review({ payload }, { call, put: _put, select }) {
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
                    const pagination = yield select(
                        state => state.admin.pagination
                    );
                    const filteredValue = yield select(
                        state => state.admin.filteredValue
                    );
                    yield put({
                        type: 'getUserList',
                        payload: { pagination, filteredValue },
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
        *noticeAll(_, { call, put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { noticeLoading: true } });
            try {
                const { data, err } = yield call(noticeAll);
                if (!err && data.success) {
                    message.success('邮件发送成功！');
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { noticeLoading: false } });
        },
        *exportList({ payload }, { call, put: _put }) {
            const put = _put.resolve;
            yield put({ type: 'save', payload: { exportLoading: true } });
            try {
                const { data, err } = yield call(exportList, payload);
                if (!err && data.success) {
                    const users = data.result.list;
                    const csvStr = users.map(user => {
                        user[5] = certTypeMap[user[5]] || user[5];
                        user[8] = reviewMap[user[8]] || user[8];
                        user[7] = user[7] ? '通过' : '未通过';
                        return user.toString();
                    }).join('\n');
                    let name = '学生信息';
                    if (payload.passed) {
                        name += '-已通过.csv';
                    } else if (payload.passed === false) {
                        name += '-未通过.csv';
                    } else {
                        name += '.csv'
                    }
                    const head = '姓名,学号,院系,手机,邮箱,免修类别,成绩,是否通过,审批意见\n';
                    fileDownload('\uFEFF' + head + csvStr, name);
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({ type: 'save', payload: { exportLoading: false } });
        },
        *openApplication(_, { call, put: _put }) {
            const put = _put.resolve;
            yield put({
                type: 'save', payload: { toggleAppStatusLoading: true },
            });
            try {
                const { data, err } = yield call(openApplication);
                if (!err && data.success) {
                    message.success('设置成功！');
                    yield put({ type: 'getAppStatus' });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({
                type: 'save', payload: { toggleAppStatusLoading: false },
            });
        },
        *closeApplication(_, { call, put: _put }) {
            const put = _put.resolve;
            yield put({
                type: 'save', payload: { toggleAppStatusLoading: true },
            });
            try {
                const { data, err } = yield call(closeApplication);
                if (!err && data.success) {
                    message.success('设置成功！');
                    yield put({ type: 'getAppStatus' });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
            yield put({
                type: 'save', payload: { toggleAppStatusLoading: false },
            });
        },
        *getAppStatus(_, { call, put: _put }) {
            const put = _put.resolve;
            try {
                const { data, err } = yield call(getAppStatus);
                if (!err && data.success) {
                    yield put({
                        type: 'save',
                        payload: {
                            appStatus: data.result,
                        },
                    });
                } else if (err) {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
        },
    },
};
