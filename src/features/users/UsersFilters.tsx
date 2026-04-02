import { observer } from 'mobx-react-lite';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useStore } from '@/store/StoreContext';

export const UsersFilters = observer(function UsersFilters() {
  const { userStore } = useStore();

  return (
    <Space wrap size="middle" style={{ marginBottom: 16, width: '100%' }}>
      <Input
        placeholder="Search by name or email…"
        prefix={<SearchOutlined />}
        allowClear
        value={userStore.searchQuery}
        onChange={(e) => userStore.setSearchQuery(e.target.value)}
        style={{ width: 260 }}
      />

      <Select
        placeholder="Filter by group"
        allowClear
        value={userStore.selectedGroupId}
        onChange={(value) => userStore.setSelectedGroupId(value ?? null)}
        style={{ width: 200 }}
        options={userStore.availableGroups.map((g) => ({
          label: g.name,
          value: g.id,
        }))}
      />

      <Select
        placeholder="Filter by group tag"
        allowClear
        value={userStore.selectedGroupTag}
        onChange={(value) => userStore.setSelectedGroupTag(value ?? null)}
        style={{ width: 200 }}
        options={userStore.availableGroupTags.map((tag) => ({
          label: tag,
          value: tag,
        }))}
      />
    </Space>
  );
});

