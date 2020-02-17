const http = require('http');
const config = require('../config');
const options = {
    hostname: '127.0.0.1',
    port: config.port,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 38,
    },
};
let suc = 0;
let err = 0;

function randDigit() {
    return parseInt(Math.random() * 10);
}

function send() {
    return new Promise((resolve, reject) => {
        const data = `email=test${randDigit()}${randDigit()}${randDigit()}@test.com&password=123456`;
        const req = http.request(options, res => {
            let resStr = '';
            res.on('data', d => {
                resStr += d;
            })
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    err += 1;
                    reject();
                    console.log(res.statusCode);
                    return;
                }
                console.log(resStr);
                const resJson = JSON.parse(resStr);
                if (resJson.success) {
                    suc += 1;
                } else {
                    err += 1;
                }
                resolve();
            });
        });
        req.on('error', error => {
            console.error(error);
            err += 1;
            reject();
        });
        req.write(data);
        req.end();
    });
}

function sleep(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}

const all = 1000;
const ps = [];
async function run() {
    let t = all;
    while (t > 0) {
        ps.push(send());
        t -= 1;
        await sleep(24);
    }
    Promise.all(ps).then(() => console.log(`All: ${all}, Suc: ${suc}, Err: ${err}`));
}
run();
