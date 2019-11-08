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
