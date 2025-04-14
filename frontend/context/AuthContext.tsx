import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string;
  setToken: (token: string) => void;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Hook to allow components to easily access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Create AuthProvider to manage the `token` state
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState("");

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
