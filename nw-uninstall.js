let Service = require('node-windows').Service;

let svc = new Service({
    name: 'exemption',
    description: 'exemption application',
    script: 'server/app.js'
});

svc.on('uninstall', function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

svc.uninstall();
