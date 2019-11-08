import dva from 'dva';
import createBrowserHistory from 'history/createBrowserHistory';
import router from './router';
import './index.less';

const app = dva({
    history: createBrowserHistory(),
});
app.router(router);
app.start('#root');
