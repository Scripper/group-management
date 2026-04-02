import { observer } from 'mobx-react-lite';
import { Table, Tag, Space, Button, Modal, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Group } from '@/domain';
import { useStore } from '@/store/StoreContext';

interface GroupsTableProps {
  onEdit: (group: Group) => void;
}

export const GroupsTable = observer(function GroupsTable({ onEdit }: GroupsTableProps) {
  const rootStore = useStore();
  const { groupStore, userStore } = rootStore;

  const confirmDelete = (group: Group) => {
    const memberCount = groupStore.memberCountByGroupId.get(group.id) ?? 0;

    Modal.confirm({
      title: 'Delete Group',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="Name">{group.name}</Descriptions.Item>
          <Descriptions.Item label="Description">
            {group.description || <span style={{ color: '#999' }}>—</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Tags">
            {group.tags.length === 0 ? (
              <span style={{ color: '#999' }}>None</span>
            ) : (
              <Space size={[0, 4]} wrap>
                {group.tags.map((tag) => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Members">{memberCount}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(group.createdAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => rootStore.deleteGroup(group.id),
    });
  };

  const columns: ColumnsType<Group> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (_, record) =>
        record.tags.length === 0 ? (
          <span style={{ color: '#999' }}>—</span>
        ) : (
          <Space size={[0, 4]} wrap>
            {record.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        ),
    },
    {
      title: 'Members',
      key: 'members',
      width: 100,
      align: 'center',
      render: (_, record) => groupStore.memberCountByGroupId.get(record.id) ?? 0,
      sorter: (a, b) =>
        (groupStore.memberCountByGroupId.get(a.id) ?? 0) -
        (groupStore.memberCountByGroupId.get(b.id) ?? 0),
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
    <Table<Group>
      rowKey="id"
      columns={columns}
      dataSource={groupStore.paginatedGroups}
      loading={groupStore.loading || groupStore.saving || userStore.loading}
      pagination={{
        current: groupStore.safeCurrentPage,
        pageSize: groupStore.pageSize,
        total: groupStore.totalFilteredGroups,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50'],
        showTotal: (total, range) => (
          <span className="pagination-total">
            Showing <b>{range[0]}–{range[1]}</b> of <b>{total}</b> groups
          </span>
        ),
        onChange: (page, size) => {
          if (size !== groupStore.pageSize) {
            groupStore.setPageSize(size);
          } else {
            groupStore.setCurrentPage(page);
          }
        },
      }}
      locale={{ emptyText: 'No groups match the current search' }}
      size="middle"
    />
  );
});

