export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}
