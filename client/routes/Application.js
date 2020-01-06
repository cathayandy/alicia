import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
    Button, Form, Input, InputNumber, Alert,
    Select, Upload, Icon, Tooltip, Row, Col
} from 'antd';
import { certTypeMap, errMap } from '../utils';
import './Application.less';

const FormItem = Form.Item;
const Option = Select.Option;
const Dragger = Upload.Dragger;

const gradeRule = '托福95分（含）以上；雅思6.5（含）以上；GMAT650分（含）以上（作文5分以上）；GRE文字推理（新制）145分（含）以上；英语六级600分（含）以上';

class Application extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
        };
        this.handleOk = this.handleOk.bind(this);
        this.normFile = this.normFile.bind(this);
        this.onCertChange = this.onCertChange.bind(this);
        this.validateScore = this.validateScore.bind(this);
    }
    validateScore(_rule, value, callback) {
        const { form } = this.props;
        const reason = form.getFieldValue('reason');
        if (isNaN(value)) {
            callback('分数不合法');
        } else if (reason === 'toefl') {
            if (value > 120 || value < 0) {
                callback('分数不合法');
            } else if (value < 95) {
                callback('分数未达标');
            } else {
                callback();
            }
        } else if (reason === 'ielts') {
            if (value > 9 || value < 0) {
                callback('分数不合法');
            } else if (value < 6.5) {
                callback('分数未达标');
            } else {
                callback();
            }
        } else if (reason === 'gmat') {
            if (value > 800 || value < 0) {
                callback('分数不合法');
            } else if (value < 650) {
                callback('分数未达标');
            } else {
                callback();
            }
        } else if (reason === 'gre') {
            if (value > 170 || value < 0) {
                callback('分数不合法');
            } else if (value < 145) {
                callback('分数未达标');
            } else {
                callback();
            }
        } else if (reason === 'cet6') {
            if (value > 710 || value < 0) {
                callback('分数不合法');
            } else if (value < 600) {
                callback('分数未达标');
            } else {
                callback();
            }
        } else {
            callback('免修类型不合法');
        }
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
    onCertChange({ file }) {
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
            user: { updateLoading, updateSuccess, verificationError, info },
            form: { getFieldDecorator },
        } = this.props;
        const id = localStorage.getItem('id');
        const token = localStorage.getItem('token');
        const headers = token ?
            { Authorization: `Bearer ${token}` } : undefined;
        const options = Object.keys(certTypeMap).map(
            k => <Option key={k} value={k}>{ certTypeMap[k] }</Option>
        );
        const tooltip = (
            <Tooltip title={gradeRule}>
                <Icon type="question-circle-o" />
            </Tooltip>
        );
        const successHint = updateSuccess ?
            <Alert
                message="上传成功，稍后返回上级页面"
                type="success"
                banner
            /> : undefined;
        const errHint = verificationError ?
            <Alert
                message={errMap[verificationError] || '上传失败'}
                type="error"
                banner
            /> : undefined;
        return (
            <div className="app-form">
                <div className="app-header">
                    <h3>上传资料</h3>
                </div>
                <form>
                    <FormItem hasFeedback>{
                        getFieldDecorator('phone', {
                            rules: [{
                                pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
                                message: '手机号不合法',
                            }],
                            initialValue: info.phone,
                        })(
                            <Input
                                prefix={<Icon type="mobile" />}
                                placeholder="请输入您的手机，选填"
                                onPressEnter={this.handleOk}
                            />
                        )
                    }</FormItem>
                    <FormItem hasFeedback>{
                        getFieldDecorator('reason', {
                            rules: [{
                                required: true,
                                message: '免修类别不能为空',
                            }],
                            initialValue: info.reason,
                        })(
                            <Select
                                placeholder="请选择您的免修类别"
                                onPressEnter={this.handleOk}
                            >
                                { options }
                            </Select>
                        )
                    }</FormItem>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col span={21}>
                            <FormItem hasFeedback>{
                                getFieldDecorator('score', {
                                    rules: [{
                                        required: true,
                                        message: '分数不能为空',
                                    }, {
                                        validator: this.validateScore,
                                    }],
                                    initialValue: info.score,
                                })(
                                
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="请填写您的分数"
                                        onPressEnter={this.handleOk}
                                    />
                                )
                            }</FormItem>
                        </Col>
                        <Col span={1}>
                        </Col>
                        <Col span={2}>
                            <FormItem>
                                { tooltip }
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem className="dragger">{
                        getFieldDecorator('cert', {
                            rules: [{
                                required: true,
                                message: '免修凭证不能为空',
                            }],
                            getValueFromEvent: this.normFile,
                        })(
                            <Dragger
                                name={`cert.${id}`}
                                multiple={false}
                                action="/api/upload/cert"
                                listType="picture"
                                accept="image/*"
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
                                <p className="ant-upload-hint">
                                    申请人须保证上传材料的真实性
                                </p>
                            </Dragger>
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
                        <Button>
                            <Link to="/account">返回</Link>
                        </Button>
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
)(Form.create()(Application));
