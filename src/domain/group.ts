export interface Group {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  name: string;
  description: string;
  tags: string[];
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  tags?: string[];
}
