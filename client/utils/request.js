import fetch from 'dva/fetch';

async function handleResponse(res) {
    const status = res.status;
    let data;
    try {
        data = await res.json();
    } catch (err) {
        data = res.statusText;
    }
    if (status >= 200 && status < 300) {
        return { data };
    } else {
        return { err: data };
    }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options={}) {
    const token = localStorage.getItem('token');
    if (token) {
        options.headers = options.headers || {};
        options.headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url, { credentials: 'include', ...options })
        .then(handleResponse)
}
