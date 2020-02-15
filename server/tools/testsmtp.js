const http = require('http');
const config = require('../config');
const options = {
    hostname: '127.0.0.1',
    port: config.port,
    path: '/api/captcha',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 21,
    },
};
let suc = 0;
let err = 0;

function randDigit() {
    return parseInt(Math.random() * 2);
}

function send() {
    return new Promise((resolve, reject) => {
        const data = `email=test${randDigit()}${randDigit()}@test.com`;
        const req = http.request(options, res => {
            let resStr = '';
            res.on('data', d => {
                resStr += d;
            })
            res.on('end', () => {
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

const all = 20;
let t = all;
const ps = [];
while (t > 0) {
    ps.push(send());
    t -= 1;
}
Promise.all(ps).then(() => console.log(`All: ${all}, Suc: ${suc}, Err: ${err}`));
