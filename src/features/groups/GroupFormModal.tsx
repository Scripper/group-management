import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, Form, Input, Select, message } from 'antd';
import type { Group } from '@/domain';
import { normalizeTags } from '@/shared/lib';
import { useStore } from '@/store/StoreContext';

interface GroupFormModalProps {
  mode: 'create' | 'edit';
  group: Group | null;
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  name: string;
  description: string;
  tags: string[];
}

export const GroupFormModal = observer(function GroupFormModal({
  mode,
  group,
  open,
  onClose,
}: GroupFormModalProps) {
  const { groupStore } = useStore();
  const [form] = Form.useForm<FormValues>();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (isEdit && group) {
        form.setFieldsValue({
          name: group.name,
          description: group.description,
          tags: group.tags,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, isEdit, group, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const input = { ...values, tags: normalizeTags(values.tags ?? []) };

      if (isEdit && group) {
        await groupStore.updateGroup(group.id, input);
        message.success('Group updated');
      } else {
        await groupStore.createGroup(input);
        message.success('Group created');
      }
      onClose();
    } catch {
      // validation errors shown inline by Ant Design
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Group' : 'Create Group'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={groupStore.saving}
      destroyOnHidden
      maskClosable={false}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, whitespace: true, message: 'Group name is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, whitespace: true, message: 'Description is required' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="tags" label="Tags" initialValue={[]}>
          <Select
            mode="tags"
            placeholder="Type a tag and press Enter…"
            tokenSeparators={[',']}
            notFoundContent={null}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

