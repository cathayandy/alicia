export function hashLinkScroll() {
    setTimeout(() => {
        const { hash } = window.location;
        if (hash !== '') {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView();
            }
        }
    }, 100);
}

export function shortenEmail(email) {
    if (email.length < 11) {
        return email;
    } else {
        return email.slice(0, 3) + '***' +
            email.slice(email.length - 5, email.length);
    }
}

export async function sleep(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}

export async function timeout(ms) {
    return new Promise((_resolve, reject) => {
        setTimeout(reject, ms);
    });
}

export function reqAll(ctx) {
    const values = ctx.keys().map(ctx);
    const keys = ctx.keys().map(k => k.slice(2));
    return keys.reduce((prev, cur, i) => (prev[cur] = values[i]) && prev, {});
}

export const reviewMap = {
    'file-broken': '证明文件损坏/无法打开',
    'file-blur': '证明文件模糊/无法辨认',
    'unmatch': '免修类别与证明文件不符',
    // 'disqualified': '未达到要求',
    // 'invalid-phone': '手机无法接通',
};

export const errMap = {
    'Not Found': '没有此用户',
    'Not Match': '您的学号和用户名不匹配',
};
