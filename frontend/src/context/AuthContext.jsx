import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // JWT is stored in httpOnly cookie by the backend.
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    // JWT is stored in httpOnly cookie by the backend.
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateUserState = (updates) =>
    setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserState,
        refetch: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
