import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { UsersPage } from '@/features/users/UsersPage';
import { GroupsPage } from '@/features/groups/GroupsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Route>
    </Routes>
  );
}

