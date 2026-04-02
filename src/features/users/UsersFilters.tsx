import { observer } from 'mobx-react-lite';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useStore } from '@/store/StoreContext';

export const UsersFilters = observer(function UsersFilters() {
  const { userStore } = useStore();

  return (
    <Space wrap size="middle" className="filters-bar">
      <Input
        placeholder="Search by name or email…"
        prefix={<SearchOutlined />}
        allowClear
        value={userStore.searchQuery}
        onChange={(e) => userStore.setSearchQuery(e.target.value)}
        className="filter-search-input"
      />

      <Select
        placeholder="Filter by group"
        allowClear
        value={userStore.selectedGroupId}
        onChange={(value) => userStore.setSelectedGroupId(value ?? null)}
        className="filter-select"
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
        className="filter-select"
        options={userStore.availableGroupTags.map((tag) => ({
          label: tag,
          value: tag,
        }))}
      />
    </Space>
  );
});

