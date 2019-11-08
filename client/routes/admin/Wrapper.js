import React, { PureComponent } from 'react';
import { withRouter, routerRedux } from 'dva/router';
import { connect } from 'dva';
import Admin from '../../components/Admin';

const menu = [{
    title: '申请管理',
    key: 'user',
    icon: 'user',
}];

class Wrapper extends PureComponent {
    onMenuClick(key) {
        const { dispatch } = this.props;
        if (key === 'logout') {
            dispatch({
                type: 'auth/logout',
            });
        } else {
            dispatch(routerRedux.push(`/admin/${key}`));
        }
    }
    render() {
        const location = this.props.location.pathname.split('/');
        const current = location[location.length - 1];
        return (
            <Admin
                menu={menu}
                onMenuClick={({ key }) => this.onMenuClick(key)}
                current={current}
                location={location}
            >
                { this.props.children }
            </Admin>
        );
    }
}

export default withRouter(connect()(Wrapper));
