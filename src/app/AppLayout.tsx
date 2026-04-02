import { useEffect } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useStore } from '@/store/StoreContext';

const { Sider, Content } = Layout;

const NAV_ITEMS = [
  { key: '/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/groups', icon: <TeamOutlined />, label: 'Groups' },
];

export function AppLayout() {
  const { userStore, groupStore } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Load both collections once on layout mount
  useEffect(() => {
    void userStore.loadUsers();
    void groupStore.loadGroups();
  }, [userStore, groupStore]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Match the active menu key even for unknown sub-paths
  const selectedKey = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.key),
  )?.key;

  return (
    <Layout className="app-layout">
      <Sider breakpoint="lg" collapsedWidth={80} width={220}>
        <div className="sidebar-logo">
          <AppstoreOutlined className="sidebar-logo-icon" />
          <Typography.Text strong className="sidebar-logo-text">
            Management
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={NAV_ITEMS}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

