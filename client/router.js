import React from 'react';
import { Router, Switch, Route, Redirect } from 'dva/router';
import dynamic from 'dva/dynamic';

function RouterConfig({ history, app }) {
    const Login = dynamic({
        app,
        models: () => [import('./models/auth')],
        component: () => import('./routes/Login'),
    });
    const Account = dynamic({
        app,
        models: () => [
            import('./models/auth'),
            import('./models/user'),
        ],
        component: () => import('./routes/Account'),
    });
    const UserAdmin = dynamic({
        app,
        models: () => [import('./models/auth')],
        component: () => import('./routes/admin/User'),
    });
    return (
        <Router history={history}>
            <Switch>
                <Route
                    exact path="/"
                    render={() => <Redirect to="/account"/>}
                />
                <Route exact path="/login" component={Login} />
                <Route exact path="/account" component={Account} />
                <Route
                    exact path="/admin"
                    render={() => <Redirect to="/admin/user"/>}
                />
                <Route exact path="/admin/user" component={UserAdmin} />
            </Switch>
        </Router>
    );
}

export default RouterConfig;
