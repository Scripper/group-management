export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  groupIds: string[];
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  groupIds?: string[];
}

export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
