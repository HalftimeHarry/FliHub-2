export type AuthSession = {
  userId: string;
  email?: string;
  token: string;
  organizationId?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
