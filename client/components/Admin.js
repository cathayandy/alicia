import React, { PureComponent } from 'react';
import { Layout, Breadcrumb, Menu, Icon } from 'antd';
const BItem = Breadcrumb.Item;
const { Sider, Content, Footer } = Layout;
import './Admin.less';

export default class Admin extends PureComponent {
    renderMenuItems() {
        const res = this.props.menu.map(({ key, icon, title }) => (
            <Menu.Item key={key}>
                <Icon type={icon} />
                <span>{ title }</span>
            </Menu.Item>
        ));
        res.push(
            <Menu.Item key="logout">
                <Icon type="logout" />
                <span>退出登录</span>
            </Menu.Item>
        );
        return res;
    }
    renderSider() {
        const { onMenuClick, current } = this.props;
        return (
            <Sider width={140}>
                <Menu
                    onClick={onMenuClick}
                    selectedKeys={[current]}
                    theme="dark"
                    mode="inline"
                >
                    { this.renderMenuItems() }
                </Menu>
            </Sider>
        );
    }
    renderLocation() {
        const { location } = this.props;
        return (
            <Breadcrumb style={{ margin: '16px 0' }}>
                { location.map(loc => <BItem key={loc}>{ loc }</BItem>) }
            </Breadcrumb>
        );
    }
    render() {
        const { children } = this.props;
        return (
            <Layout className="dashboard-container">
                { this.renderSider() }
                <Layout>
                    <Content className="dashboard-wrapper">
                        { this.renderLocation() }
                        <div className="dashboard-content">
                            { children }
                        </div>
                    </Content>
                    <Footer className="dashboard-footer">
                        Alicia ©2019 Created by Cathayandy
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}
