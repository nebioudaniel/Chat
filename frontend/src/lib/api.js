export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  register: (username, password) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => request("/api/auth/me"),

  changeUserId: () =>
    request("/api/auth/userid", { method: "PATCH" }),

  getUser: (userId) => request(`/api/user/${userId}`),

  getGroups: () => request("/api/groups"),

  createGroup: (name, memberIds) =>
    request("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, memberIds }),
    }),

  getMessages: (threadId) => request(`/api/messages/${threadId}`),

  getConversations: () => request("/api/conversations"),
};
