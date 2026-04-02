import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, Form, Input, Select, message } from 'antd';
import type { User } from '@/domain';
import { useStore } from '@/store/StoreContext';

interface UserFormModalProps {
  mode: 'create' | 'edit';
  user: User | null;
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  groupIds: string[];
}

export const UserFormModal = observer(function UserFormModal({
  mode,
  user,
  open,
  onClose,
}: UserFormModalProps) {
  const { userStore, groupStore } = useStore();
  const [form] = Form.useForm<FormValues>();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (isEdit && user) {
        form.setFieldsValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          groupIds: user.groupIds,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, isEdit, user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && user) {
        await userStore.updateUser(user.id, values);
        message.success('User updated');
      } else {
        await userStore.createUser(values);
        message.success('User created');
      }
      onClose();
    } catch {
      // validation errors shown inline by Ant Design
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit User' : 'Create User'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={userStore.saving}
      destroyOnHidden
      maskClosable={false}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, whitespace: true, message: 'First name is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, whitespace: true, message: 'Last name is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email address' },
            {
              validator: (_, value: string) => {
                if (!value) return Promise.resolve();
                const excludeId = isEdit && user ? user.id : undefined;
                if (userStore.isEmailUnique(value, excludeId)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('This email is already taken'));
              },
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="groupIds" label="Groups" initialValue={[]}>
          <Select
            mode="multiple"
            placeholder="Assign groups…"
            options={groupStore.groups.map((g) => ({
              label: g.name,
              value: g.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});


