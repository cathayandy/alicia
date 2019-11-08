import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Icon } from 'antd';
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
        const { auth: { loading }, form: { getFieldDecorator } } = this.props;
        return (
            <div className="login-form">
                <div className="login-header">
                    <h3>免修申请平台 - 请登录</h3>
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
                            loading={loading}

                        >
                            登录
                        </Button>
                    </FormItem>
                </form>
            </div>
        );
    }
};

export default connect(({ auth }) => ({ auth }))(Form.create()(Login));
