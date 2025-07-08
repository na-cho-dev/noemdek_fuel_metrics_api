// UUID Type
export type UUID = string;

// Authenticated User Context
export interface AuthenticatedUser {
  userId: UUID;
  email: string;
  organizerId: string;
  role: string;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
}
