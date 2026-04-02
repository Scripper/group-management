import { useState, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Spin, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { User } from '@/domain';
import { useStore } from '@/store/StoreContext';
import { useUrlSync } from '@/shared/hooks/useUrlSync';
import type { UrlSyncBinding } from '@/shared/hooks/useUrlSync';
import { UsersFilters } from './UsersFilters';
import { UsersTable } from './UsersTable';
import { UserFormModal } from './UserFormModal';

export const UsersPage = observer(function UsersPage() {
  const { userStore } = useStore();

  // URL ↔ Store sync
  const urlBindings = useMemo<UrlSyncBinding[]>(
    () => [
      {
        key: 'q',
        toUrl: () => userStore.searchQuery || null,
        fromUrl: (v) => { userStore.searchQuery = v; },
      },
      {
        key: 'group',
        toUrl: () => userStore.selectedGroupId,
        fromUrl: (v) => { userStore.selectedGroupId = v; },
      },
      {
        key: 'tag',
        toUrl: () => userStore.selectedGroupTag,
        fromUrl: (v) => { userStore.selectedGroupTag = v; },
      },
      {
        key: 'page',
        toUrl: () => String(userStore.safeCurrentPage),
        fromUrl: (v) => { userStore.currentPage = parseInt(v, 10) || 1; },
        defaultValue: '1',
      },
      {
        key: 'size',
        toUrl: () => String(userStore.pageSize),
        fromUrl: (v) => { userStore.pageSize = parseInt(v, 10) || 10; },
        defaultValue: '10',
      },
    ],
    [userStore],
  );
  useUrlSync(urlBindings);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setModalMode('create');
  }, []);

  const openEdit = useCallback((user: User) => {
    setEditingUser(user);
    setModalMode('edit');
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingUser(null);
  }, []);

  if (userStore.loading && userStore.users.length === 0) {
    return (
      <Spin tip="Loading users…" size="large" style={{ marginTop: 64 }}>
        <div style={{ minHeight: 200 }} />
      </Spin>
    );
  }

  return (
    <>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <Typography.Title level={2} style={{ margin: 0 }}>
          Users
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add User
        </Button>
      </Space>

      <UsersFilters />
      <UsersTable onEdit={openEdit} />

      <UserFormModal
        mode={modalMode === 'edit' ? 'edit' : 'create'}
        user={editingUser}
        open={modalMode !== null}
        onClose={closeModal}
      />
    </>
  );
});
