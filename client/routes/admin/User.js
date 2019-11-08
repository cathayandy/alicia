import React, { PureComponent } from 'react';
import { Table } from 'antd';
import request from '../../utils/request';
import Admin from './Wrapper';

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
    title: '免修原因',
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

export default class UserAdmin extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
        };
    }
    componentDidMount() {
        request('/api/users', {
            method: 'GET',
        }).then(({ data }) => {
            if (data.success) {
                this.setState({
                    users: data.result.list,
                })
            }
        });
    }
    render() {
        return (
            <Admin>
                <Table
                    rowKey="id" columns={columns}
                    dataSource={this.state.users}
                />
            </Admin>
        );
    }
}
