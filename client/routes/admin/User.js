import React, { PureComponent } from 'react';
import { Table, Modal, Icon, Switch, Button, Select } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Admin from './Wrapper';
import { reviewMap, certTypeMap } from '../../utils';

const Option = Select.Option;

const columns = [{
    key: 'id',
    dataIndex: 'id',
    title: '学号',
}, {
    key: 'name',
    dataIndex: 'name',
    title: '姓名',
}, {
    key: 'institute',
    dataIndex: 'institute',
    title: '院系',
}, {
    key: 'phone',
    dataIndex: 'phone',
    title: '手机',
}, {
    key: 'email',
    dataIndex: 'email',
    title: '邮箱',
}, {
    key: 'reason',
    dataIndex: 'reason',
    title: '免修类别',
    render: (_text, record) => {
        return certTypeMap[record.reason] || record.reason;
    }
}, {
    key: 'score',
    dataIndex: 'score',
    title: '成绩',
}, {
    key: 'cert',
    dataIndex: 'cert',
    title: '证明文件',
}, {
    key: 'passed',
    dataIndex: 'passed',
    title: '是否通过',
    render: (_text, record) => {
        return record.passed ? '是' : '否';
    }
}, {
    key: 'review',
    dataIndex: 'review',
    title: '审批意见',
}];

class UserAdmin extends PureComponent {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.permit = this.permit.bind(this);
        this.review = this.review.bind(this);
        this.batchPermit = this.batchPermit.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    openModal(record) {
        return () => Modal.confirm({
            title: `免修凭证 - ${record.id}`,
            content: <img style={{ width: '100%' }} src={`/${record.cert}`}/>,
            okText: '通过',
            cancelText: '返回',
            onOk: () => this.permit(record)(true),
            onCancel: () => {},
        });
    }
    batchPermit() {
        this.props.dispatch({
            type: 'admin/batchPermit',
        });
    }
    permit(record) {
        return checked => {
            if (checked) {
                this.props.dispatch({
                    type: 'admin/permit',
                    payload: {
                        id: record.id,
                    },
                });
            } else {
                this.props.dispatch({
                    type: 'admin/reject',
                    payload: {
                        id: record.id,
                    },
                });
            }
        }
    }
    review(record) {
        return value => {
            this.props.dispatch({
                type: 'admin/review',
                payload: {
                    id: record.id,
                    review: value,
                },
            });
        }
    }
    onSelect(record, selected) {
        if (selected) {
            this.props.dispatch({
                type: 'admin/select',
                payload: {
                    list: [record.id],
                },
            });
        } else {
            this.props.dispatch({
                type: 'admin/unselect',
                payload: {
                    list: [record.id],
                },
            });
        }
    }
    onSelectAll(selected, _selectedRows, changeRows) {
        if (selected) {
            this.props.dispatch({
                type: 'admin/select',
                payload: {
                    list: changeRows.map(row => row.id),
                },
            });
        } else {
            this.props.dispatch({
                type: 'admin/unselect',
                payload: {
                    list: changeRows.map(row => row.id),
                },
            });
        }
    }
    onChange(pagination) {
        this.props.dispatch(
            routerRedux.push(`/admin/user?page=${pagination.current}`
        ));
    }
    render() {
        columns[7].render = (_text, record) => {
            return <a onClick={this.openModal(record)}><Icon type="eye" /></a>;
        };
        columns[8].render = (_text, record) => {
            return (
                <Switch
                    size="small"
                    checked={record.passed}
                    onChange={this.permit(record)}
                    loading={this.props.admin.permitLoading.has(record.id)}
                />
            );
        };
        const options = Object.keys(reviewMap).map(
            k => <Option key={k} value={k}>{ reviewMap[k] }</Option>
        );
        columns[9].render = (_text, record) => {
            return (
                <Select
                    size="small"
                    style={{ width: 150 }}
                    placeholder="选择反馈"
                    value={record.review}
                    onChange={this.review(record)}
                >
                    <Option value="">暂无</Option>
                    { options }
                </Select>
            );
        };
        const rowSelection = {
            onSelect: this.onSelect,
            onSelectAll: this.onSelectAll,
            selectedRowKeys: [...this.props.admin.selected.values()],
        };
        return (
            <Admin>
                <Table
                    size="middle" rowKey="id" columns={columns}
                    rowSelection={rowSelection}
                    pagination={this.props.admin.pagination}
                    dataSource={this.props.admin.users}
                    onChange={this.onChange}
                    loading={this.props.admin.listLoading}
                />
                <Button
                    style={{ marginTop: '-45px', float: 'left' }}
                    onClick={this.batchPermit}
                    type="primary"
                >
                    全部通过
                </Button>
            </Admin>
        );
    }
}

export default connect(({ admin }) => ({ admin }))(UserAdmin);
