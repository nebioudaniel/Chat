import { createContext, createSignal, onMount, useContext } from "solid-js";
import { api } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const data = await api.me();
        setUser(data);
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  });

  async function register(username, password) {
    const data = await api.register(username, password);
    localStorage.setItem("token", data.token);
    setUser({ _id: data._id, userId: data.userId, username: data.username, groups: [] });
    return data;
  }

  async function login(username, password) {
    const data = await api.login(username, password);
    localStorage.setItem("token", data.token);
    setUser({ _id: data._id, userId: data.userId, username: data.username, groups: [] });
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  function updateUser(userData) {
    setUser((prev) => (prev ? { ...prev, ...userData } : prev));
  }

  function updateUserGroups(groups) {
    setUser((prev) => (prev ? { ...prev, groups } : prev));
  }

  const store = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    updateUserGroups,
  };

  return <AuthContext.Provider value={store}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
