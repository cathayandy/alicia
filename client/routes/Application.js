import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
    Button, Form, Input, InputNumber,
    Select, Upload, Icon, Tooltip, Row, Col
} from 'antd';
import { certTypeMap } from '../utils';
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
            user: { updateLoading },
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
        return (
            <div className="app-form">
                <div className="app-header">
                    <h3>上传资料</h3>
                </div>
                <form>
                    <FormItem hasFeedback>{
                        getFieldDecorator('phone', {
                            rules: [{
                                pattern: /^1((3|4|5|7|8)\d{0,9})?$/,
                                message: '手机号不合法',
                            }],
                        })(
                            <Input
                                prefix={<Icon type="mobile" />}
                                placeholder="请输入您的手机，选填"
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
                                message: '免修类别不能为空',
                            }],
                        })(
                            <Select
                                placeholder="请选择您的免修类别"
                                onPressEnter={() => this.handleOk()}
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
                                    }],
                                })(
                                
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="请填写您的分数"
                                        onPressEnter={() => this.handleOk()}
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
                    <FormItem>{
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
