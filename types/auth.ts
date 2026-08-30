export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
}

export interface AuthUser {
  username: string
  role: UserRole
}
