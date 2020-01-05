let Service = require('node-windows').Service;

let svc = new Service({
   name: 'exemption',
   description: 'exemption application',
   script: 'server/app.js'
});

svc.on('install', () => {
   svc.start();
});

svc.install();
