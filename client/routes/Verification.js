import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Alert, Button, Form, Input, Icon } from 'antd';
import { errMap } from '../utils';
import './Verification.less';

const FormItem = Form.Item;

const hint = '请填写您的清华学号和姓名，作为身份认证。一旦认证通过，您的身份信息将不可修改，请如实填写，谢谢！（限学号2016、2017、2018开头的同学认证，如有问题，请联系老师）';

class Verification extends PureComponent {
    constructor(props) {
        super(props);
        this.handleOk = this.handleOk.bind(this);
        this.logout = this.logout.bind(this);
    }
    logout() {
        this.props.dispatch({
            type: 'user/logout',
        });
    }
    handleOk() {
        const { form: { validateFieldsAndScroll }, dispatch } = this.props;
        validateFieldsAndScroll((errors, values) => {
            if (errors) {
                return;
            }
            dispatch({ type: 'user/updateInfo', payload: values });
        });
    }
    render() {
        const {
            user: { updateLoading, verificationError, updateSuccess },
            form: { getFieldDecorator },
        } = this.props;
        const successHint = updateSuccess ?
            <Alert
                message="认证成功，稍后返回上级页面"
                type="success"
                banner
            /> : undefined;
        const errHint = verificationError ?
            <Alert
                message={errMap[verificationError] || '认证失败'}
                type="error"
                banner
            /> : undefined;
        return (
            <div className="verification-form">
                <div className="verification-header">
                    <h3>身份认证</h3>
                </div>
                <form>
                    <FormItem>
                        <Alert banner message={hint} type="info" />
                    </FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('studentId', {
                            rules: [{
                                required: true,
                                message: '学号不能为空',
                            }, {
                                pattern: /^\d{10}$/,
                                message: '学号不合法',
                            }],
                        })(
                            <Input
                                prefix={<Icon type="idcard" />}
                                placeholder="请输入您的学号"
                                onPressEnter={this.handleOk}
                            />
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: '姓名不能为空',
                            }],
                        })(
                            <Input
                                prefix={<Icon type="user" />}
                                placeholder="请输入您的姓名"
                                onPressEnter={this.handleOk}
                            />
                        )
                    }</FormItem>
                    <FormItem className="center">
                        <Button
                            type="primary"
                            onClick={this.handleOk}
                            loading={updateLoading}
                        >
                            提交
                        </Button>
                    </FormItem>
                    <FormItem className="center">
                        <Button onClick={this.logout}>退出登录</Button>
                    </FormItem>
                    { successHint }
                    { errHint }
                </form>
            </div>
        );
    }
};

export default connect(
    ({ auth, user }) => ({ auth, user })
)(Form.create()(Verification));
