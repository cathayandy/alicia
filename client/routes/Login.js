import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Icon, Alert } from 'antd';
import { errMap } from '../utils';
import './Login.less';

const FormItem = Form.Item;

class Login extends PureComponent {
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
                        getFieldDecorator('id', {
                            rules: [{
                                required: true,
                            }],
                        })(
                            <Input
                                prefix={<Icon type="idcard" />}
                                placeholder="请输入您的学号"
                                onPressEnter={() => this.handleOk()}
                            />
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('name', {
                            rules: [{
                                required: true,
                            }],
                        })(
                            <Input
                                prefix={<Icon type="user" />}
                                placeholder="请输入您的姓名"
                                onPressEnter={() => this.handleOk()}
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
                        { errHint }
                    </FormItem>
                </form>
            </div>
        );
    }
};

export default connect(({ auth }) => ({ auth }))(Form.create()(Login));
