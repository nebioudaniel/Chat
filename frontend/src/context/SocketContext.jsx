import { createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider(props) {
  const auth = useAuth();
  const [socket, setSocket] = createSignal(null);
  const [onlineUsers, setOnlineUsers] = createSignal(new Set());

  createEffect(() => {
    const user = auth.user();
    if (user && !socket()) {
      const token = localStorage.getItem("token");
      if (token) {
        import("socket.io-client").then(({ io }) => {
          import("../lib/api.js").then(({ API_URL }) => {
            const s = io(API_URL, { auth: { token } });

            s.on("connect_error", (err) => {
              console.error("Socket connection error:", err.message);
            });

            s.on("presence", ({ online }) => {
              setOnlineUsers(new Set(online));
            });

            s.on("disconnect", () => {
              console.log("Socket disconnected");
            });

            setSocket(s);
          });
        });
      }
    }
  });

  createEffect(() => {
    if (!auth.user() && socket()) {
      socket()?.disconnect();
      setSocket(null);
      setOnlineUsers(new Set());
    }
  });

  onCleanup(() => {
    socket()?.disconnect();
  });

  function emit(event, data) {
    const s = socket();
    if (s) s.emit(event, data);
  }

  function on(event, handler) {
    const s = socket();
    if (s) s.on(event, handler);
    return () => s?.off(event, handler);
  }

  function disconnect() {
    const s = socket();
    if (s) {
      s.disconnect();
      setSocket(null);
      setOnlineUsers(new Set());
    }
  }

  const store = {
    socket,
    emit,
    on,
    disconnect,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={store}>{props.children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
