export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | "moderator";
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (logoutAll?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    inviteCode: string
  ) => Promise<void>;
  verifyToken: () => Promise<void>;
}
