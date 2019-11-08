import request from '../utils/request';

async function getById() {
    const id = localStorage.getItem('id');
    if (!id) {
        return Promise.reject('Not login');
    }
    return request(`/api/users/${encodeURIComponent(id)}`);
}

export default {
    namespace: 'user',
    state: {
        userLoading: false,
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
        *getById(_, { put, call }) {
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
    },
};
