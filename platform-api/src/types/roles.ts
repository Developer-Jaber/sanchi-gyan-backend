export const Roles = {
  Student: 'Student',
  Teacher: 'Teacher',
  Admin: 'Admin',
} as const;

export type RoleName = typeof Roles[keyof typeof Roles];
