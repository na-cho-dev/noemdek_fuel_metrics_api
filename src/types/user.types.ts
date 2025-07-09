// UUID Type
export type UUID = string;

// Authenticated User Context
export interface AuthenticatedUser {
  id: UUID;
  email: string;
  role?: string;
  permissions?: string[];
  name: string;
  isVerified: boolean;
}
