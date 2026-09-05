export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Guest = 'guest',
}

export interface AuthUser {
  username: string
  role: UserRole
}
