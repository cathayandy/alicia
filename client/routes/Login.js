import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button, Form, Input, Icon, Alert } from 'antd';
import { errMap } from '../utils';
import './Login.less';

const FormItem = Form.Item;

class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.handleOk = this.handleOk.bind(this);
    }
    handleOk() {
        const { form: { validateFieldsAndScroll }, dispatch } = this.props;
        validateFieldsAndScroll((errors, values) => {
            if (errors) {
                return;
            }
            dispatch({ type: 'auth/login', payload: values });
        });
    }
    render() {
        const {
            auth: { loginLoading, loginError },
            form: { getFieldDecorator },
        } = this.props;
        const errHint = loginError ?
            <Alert
                message={errMap[loginError] || '登录错误'}
                type="error"
                banner
            /> : undefined;
        return (
            <div className="login-form">
                <div className="login-header">
                    <h3>英语水平考试免修申请平台</h3>
                </div>
                <form>
                    <FormItem hasFeedback>{
                        getFieldDecorator('email', {
                            rules: [{
                                required: true,
                                message: '邮箱不能为空',
                            }, {
                                type: 'email',
                                message: '非法的邮箱格式',
                            }],
                        })(
                            <Input
                                prefix={<Icon type="mail" />}
                                placeholder="请输入您的邮箱"
                                onPressEnter={this.handleOk}
                            />
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('password', {
                            rules: [{
                                required: true,
                                message: '密码不能为空',
                            }],
                        })(
                            <Input
                                type="password"
                                prefix={<Icon type="lock" />}
                                onPressEnter={this.handleOk}
                                placeholder="请输入您的密码"
                            />
                        )
                    }</FormItem>
                    <FormItem className="center">
                        <Button
                            type="primary"
                            onClick={() => this.handleOk()}
                            loading={loginLoading}
                        >
                            登录
                        </Button>
                    </FormItem>
                    <FormItem className="center">
                        <Button>
                            <Link to="/register">去注册</Link>
                        </Button>
                    </FormItem>
                    { errHint }
                </form>
            </div>
        );
    }
};

export default connect(({ auth }) => ({ auth }))(Form.create()(Login));
