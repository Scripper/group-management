import { observer } from 'mobx-react-lite';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useStore } from '@/store/StoreContext';

export const GroupsSearch = observer(function GroupsSearch() {
  const { groupStore } = useStore();

  return (
    <Input
      placeholder="Search by name, description, or tag…"
      prefix={<SearchOutlined />}
      allowClear
      value={groupStore.searchQuery}
      onChange={(e) => groupStore.setSearchQuery(e.target.value)}
      className="groups-search-input"
    />
  );
});

