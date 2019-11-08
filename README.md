# Alicia - An Exemption Application Platform

Alicia is a platform for course exemption applications. Students can apply for course exemptions and check their results using the platform. Teachers can manage applications, review them and approve/disapprove them using the platform.

Built using [Dva.js](https://dvajs.com/), [Ant Design](https://ant.design), [Webpack](https://webpack.js.org/), [Koa.js](https://koajs.com/) and [MySQL](https://www.mysql.com/).

## Prerequisite

*   [Node.js v8+](https://nodejs.org)
    
    It is recommanded using [Node Version Manager](https://github.com/creationix/nvm) aka nvm to install Node.js on your server.

    1.  Install nvm

            curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

    2.  Using nvm to install Node.js (e.g. v8)

            nvm install v8
            nvm alias default v8

*   A running MySQL server

## Build

    git clone git@github.com:cathayandy/alicia.git
    cd alicia
    npm install

*   Run backend services:
            
        npm start

*   Run a webpack-dev-server:

        npm run dev

*   Build & watch development static files:

        npm run watch
    
*   Build production static files:

        npm run build

*   Build production static files with bundle details:

        npm run dump

> Hint: you can use a faster npm registry in Mainland China

    npm config set registry https://registry.npm.taobao.org/

## Customize

Edit `server/config.json` to customize server configs. If there's no `server/config.json`, run the app and it will copy one from `server/config.json.sample`.

## Nginx Configuration

If you serve the website using an Nginx server, you have to add a `try_files` rule in your `nginx.conf`:
    
    ...
    server {
        ...
        location / {
            try_files $uri /index.html;
        }
        ...
    }
    ...

## Admin Dashboard

You need to prepare student data in `server/students.csv`, following the structure in `server/students.csv.sample`. Then run `npm run load` to load initial data.

Visit `/admin` to enter the admin dashboard.

Initial settings:

```
id: admin
name: admin
```

You can see `server/students.csv.sample` and `server/config.json.sample` for more details.

## Lisence

[MIT](https://tldrlegal.com/license/mit-license)
