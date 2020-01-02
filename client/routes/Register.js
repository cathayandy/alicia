import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button, Form, Input, Icon, Alert } from 'antd';
import { errMap } from '../utils';
import './Register.less';

const FormItem = Form.Item;
const Search = Input.Search;

class Register extends PureComponent {
    constructor(props) {
        super(props);
        this.compareToFirstPassword = this.compareToFirstPassword.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.sendCaptcha = this.sendCaptcha.bind(this);
    }
    compareToFirstPassword(_rule, value, callback) {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('您两次输入的密码不一致，请重新输入');
        } else {
            callback();
        }
    }
    validatePassword(_rule, value, callback) {
        if (value && !/^.*(?=.{8,20})(?=.*\d)(?=.*[A-Za-z]).*$/.test(value)) {
            callback('密码限制为8-20位，必须同时含有字母和数字');
        } else {
            callback();
        }
    }
    handleOk() {
        const { form: { validateFieldsAndScroll }, dispatch } = this.props;
        validateFieldsAndScroll((errors, values) => {
            if (errors) {
                return;
            }
            dispatch({ type: 'auth/register', payload: values });
        });
    }
    sendCaptcha() {
        const { form: { validateFieldsAndScroll }, dispatch } = this.props;
        validateFieldsAndScroll(['email'], (errors, values) => {
            if (errors) {
                return;
            }
            dispatch({ type: 'auth/sendCaptcha', payload: values });
        });
    }
    render() {
        const {
            auth: {
                registerLoading, registerError,
                captchaLoading, remaining,
            },
            form: { getFieldDecorator },
        } = this.props;
        const errHint = registerError ?
            <Alert
                message={errMap[registerError] || '注册失败'}
                type="error"
                banner
            /> : undefined;
        const captchaText = remaining > 0 ?
            `${remaining}秒后重发` : '发送';
        return (
            <div className="register-form">
                <div className="register-header">
                    <h3>新用户注册</h3>
                </div>
                <form>
                    <FormItem hasFeedback>{
                        getFieldDecorator('email', {
                            rules: [{
                                required: true,
                                message: '邮箱不能为空',
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
                            }, {
                                validator: this.validatePassword,
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
                    <FormItem hasFeedback>{
                        getFieldDecorator('confirm', {
                            rules: [{
                                required: true,
                                message: '确认密码不能为空',
                            }, {
                                validator: this.compareToFirstPassword,
                            }],
                        })(
                            <Input
                                type="password"
                                prefix={<Icon type="lock" />}
                                onPressEnter={this.handleOk}
                                placeholder="请确认您的密码"
                            />
                        )
                    }</FormItem>
                    <FormItem>{
                        getFieldDecorator('captcha', {
                            rules: [{
                                required: true,
                                message: '验证码不能为空',
                            }],
                        })(
                            <Search
                                placeholder="请输入验证码"
                                enterButton={
                                    <Button
                                        loading={captchaLoading}
                                        disabled={remaining > 0}
                                    >
                                        { captchaText }
                                    </Button>
                                }
                                onSearch={this.sendCaptcha}
                            />
                        )
                    }</FormItem>
                    <FormItem className="center">
                        <Button
                            type="primary"
                            className="full"
                            onClick={this.handleOk}
                            loading={registerLoading}
                        >
                            注册
                        </Button>
                    </FormItem>
                    <FormItem className="center">
                        <Button className="full">
                            <Link to="/login">去登录</Link>
                        </Button>
                    </FormItem>
                    { errHint }
                </form>
            </div>
        );
    }
};

export default connect(({ auth }) => ({ auth }))(Form.create()(Register));
