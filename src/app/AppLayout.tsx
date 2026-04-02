import { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={80}>
        <div style={{ height: 32, margin: 16, color: '#fff', fontWeight: 600, fontSize: 16, textAlign: 'center' }}>
          Management
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

