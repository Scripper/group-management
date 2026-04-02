import { useState, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Spin, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Group } from '@/domain';
import { useStore } from '@/store/StoreContext';
import { useUrlSync } from '@/shared/hooks/useUrlSync';
import type { UrlSyncBinding } from '@/shared/hooks/useUrlSync';
import { GroupsSearch } from './GroupsSearch';
import { GroupsTable } from './GroupsTable';
import { GroupFormModal } from './GroupFormModal';

export const GroupsPage = observer(function GroupsPage() {
  const { groupStore } = useStore();

  // URL ↔ Store sync
  const urlBindings = useMemo<UrlSyncBinding[]>(
    () => [
      {
        key: 'q',
        toUrl: () => groupStore.searchQuery || null,
        fromUrl: (v) => { groupStore.searchQuery = v; },
      },
      {
        key: 'page',
        toUrl: () => String(groupStore.safeCurrentPage),
        fromUrl: (v) => { groupStore.currentPage = parseInt(v, 10) || 1; },
        defaultValue: '1',
      },
      {
        key: 'size',
        toUrl: () => String(groupStore.pageSize),
        fromUrl: (v) => { groupStore.pageSize = parseInt(v, 10) || 10; },
        defaultValue: '10',
      },
    ],
    [groupStore],
  );
  useUrlSync(urlBindings);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const openCreate = useCallback(() => {
    setEditingGroup(null);
    setModalMode('create');
  }, []);

  const openEdit = useCallback((group: Group) => {
    setEditingGroup(group);
    setModalMode('edit');
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingGroup(null);
  }, []);

  if (groupStore.loading && groupStore.groups.length === 0) {
    return (
      <Spin tip="Loading groups…" size="large" className="page-loading-spinner">
        <div className="page-loading-placeholder" />
      </Spin>
    );
  }

  return (
    <>
      <Space className="page-header">
        <Typography.Title level={2} className="page-title">
          Groups
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Group
        </Button>
      </Space>

      <GroupsSearch />
      <GroupsTable onEdit={openEdit} />

      <GroupFormModal
        mode={modalMode === 'edit' ? 'edit' : 'create'}
        group={editingGroup}
        open={modalMode !== null}
        onClose={closeModal}
      />
    </>
  );
});
