import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Tag, Space, Button, Modal, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/domain';
import { fullName } from '@/domain';
import { useStore } from '@/store/StoreContext';

interface UsersTableProps {
  onEdit: (user: User) => void;
}

export const UsersTable = observer(function UsersTable({ onEdit }: UsersTableProps) {
  const { userStore, groupStore } = useStore();

  const groupNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groupStore.groups) {
      map.set(g.id, g.name);
    }
    return map;
  }, [groupStore.groups]);

  const confirmDelete = (user: User) => {
    const groups = user.groupIds
      .map((gid) => groupNameById.get(gid) ?? gid);

    Modal.confirm({
      title: 'Delete User',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="Full Name">{fullName(user)}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Groups">
            {groups.length === 0 ? (
              <span style={{ color: '#999' }}>None</span>
            ) : (
              <Space size={[0, 4]} wrap>
                {groups.map((name) => (
                  <Tag key={name}>{name}</Tag>
                ))}
              </Space>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(user.createdAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => userStore.deleteUser(user.id),
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_, record) => fullName(record),
      sorter: (a, b) => fullName(a).localeCompare(fullName(b)),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Groups',
      key: 'groups',
      render: (_, record) =>
        record.groupIds.length === 0 ? (
          <span style={{ color: '#999' }}>—</span>
        ) : (
          <Space size={[0, 4]} wrap>
            {record.groupIds.map((gid) => (
              <Tag key={gid}>{groupNameById.get(gid) ?? gid}</Tag>
            ))}
          </Space>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table<User>
      rowKey="id"
      columns={columns}
      dataSource={userStore.paginatedUsers}
      loading={userStore.loading || userStore.saving}
      pagination={{
        current: userStore.safeCurrentPage,
        pageSize: userStore.pageSize,
        total: userStore.totalFilteredUsers,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50'],
        showTotal: (total, range) => (
          <span className="pagination-total">
            Showing <b>{range[0]}–{range[1]}</b> of <b>{total}</b> users
          </span>
        ),
        onChange: (page, size) => {
          if (size !== userStore.pageSize) {
            userStore.setPageSize(size);
          } else {
            userStore.setCurrentPage(page);
          }
        },
      }}
      locale={{ emptyText: 'No users match the current filters' }}
      size="middle"
    />
  );
});

