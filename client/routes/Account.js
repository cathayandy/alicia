import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button } from 'antd';
import './Account.less';

class Account extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.submit = this.submit.bind(this);
        this.logout = this.logout.bind(this);
    }
    submit() {
        this.props.dispatch({
            type: 'user/updateInfo',
            payload: {
            },
        });
    }
    logout() {
        this.props.dispatch({
            type: 'auth/logout',
        });
    }
    renderInfo() {
        return (
            <Fragment>
                <div className="account-header">
                    <h3>您的信息</h3>
                </div>
                <p>学号：{ this.props.user.info.id }</p>
                <p>姓名：{ this.props.user.info.name }</p>
                <p>是否通过：{ this.props.user.info.passed ? '是' : '否' }</p>
                <p>审核意见：{ this.props.user.info.review || '暂无' }</p>
                <Button type="primary">
                    <Link to="/application">上传/修改资料</Link>
                </Button>
            </Fragment>
        );
    }
    renderLogout() {
        return <Button onClick={this.logout}>退出登录</Button>;
    }
    render() {
        return (
            <div className="account-form">
                { this.renderInfo() }
                { this.renderLogout() }
            </div>
        );
    }
}
export default connect(({ user }) => ({ user }))(Account);
