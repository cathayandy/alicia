import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button, Form, Input, Select, Upload, Icon } from 'antd';
import './Application.less';

const FormItem = Form.Item;
const Option = Select.Option;
const Dragger = Upload.Dragger;

class Application extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
        };
        this.normFile = this.normFile.bind(this);
        this.onCertChange = this.onCertChange.bind(this);
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
    normFile(e) {
        if (e.file.status === 'done' && e.file.response.success) {
            const id = localStorage.getItem('id');
            return `cert.${id}`;
        }
    }
    onCertChange({ file, fileList, event }) {
        if (file.status === 'done' || file.status === 'uploading') {
            if ((this.state.fileList[0] || {}).uid !== file.uid) {
                this.setState({ fileList: [file] });
            }
        } else if ((this.state.fileList[0] || {}).uid === file.uid) {
            this.setState({ fileList: [] });
        }
    }
    render() {
        const {
            user: { updateLoading },
            form: { getFieldDecorator },
        } = this.props;
        const id = localStorage.getItem('id');
        const token = localStorage.getItem('token');
        const headers = token ?
            { Authorization: `Bearer ${token}` } : undefined;
        return (
            <div className="app-form">
                <div className="app-header">
                    <h3>上传资料</h3>
                </div>
                <form>
                    <FormItem hasFeedback>{
                        getFieldDecorator('phone', {
                            rules: [{
                                required: true,
                            }],
                        })(
                            <Input
                                prefix={<Icon type="mobile" />}
                                placeholder="请输入您的手机"
                                onPressEnter={() => this.handleOk()}
                            />
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('email', {
                            rules: [{
                                required: true,
                            }],
                        })(
                            <Input
                                prefix={<Icon type="mail" />}
                                placeholder="请输入您的邮箱"
                                onPressEnter={() => this.handleOk()}
                            />
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('reason', {
                            rules: [{
                                required: true,
                            }],
                        })(
                            <Select
                                placeholder="请选择您的免修类型"
                                onPressEnter={() => this.handleOk()}
                            >
                                <Option value="toefl">托福</Option>
                                <Option value="cet4">大学英语四级</Option>
                                <Option value="cet6">大学英语六级</Option>
                            </Select>
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('cert', {
                            rules: [{
                                required: true,
                            }],
                            getValueFromEvent: this.normFile,
                        })(
                            <Dragger
                                name={`cert.${id}`}
                                multiple={false}
                                action="/api/upload/cert"
                                listType="picture"
                                headers={headers}
                                fileList={this.state.fileList}
                                onChange={this.onCertChange}
                            >
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">
                                    请上传您的免修凭证
                                </p>
                            </Dragger>
                        )
                    }</FormItem>
                    <FormItem className="center">
                        <Button
                            type="primary"
                            onClick={() => this.handleOk()}
                            loading={updateLoading}

                        >
                            提交
                        </Button>
                    </FormItem>
                    <FormItem className="center">
                        <Button>
                            <Link to="account">返回</Link>
                        </Button>
                    </FormItem>
                </form>
            </div>
        );
    }
};

export default connect(
    ({ auth, user }) => ({ auth, user })
)(Form.create()(Application));
