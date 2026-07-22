import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { api } from "../lib/api";

export default function Sidebar() {
  const auth = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = createSignal([]);
  const [groups, setGroups] = createSignal([]);
  const [changingId, setChangingId] = createSignal(false);

  onMount(async () => {
    try {
      const [convData, groupData] = await Promise.all([
        api.getConversations(),
        api.getGroups(),
      ]);
      setConversations(convData);
      setGroups(groupData.map((g) => ({
        groupId: g.groupId,
        name: g.name,
        memberCount: g.members.length,
      })));
    } catch (err) {
      console.error("Failed to load sidebar data:", err.message);
    }
  });

  function handleLogout() {
    socket.disconnect();
    auth.logout();
    navigate("/auth");
  }

  async function handleChangeId() {
    setChangingId(true);
    try {
      const data = await api.changeUserId();
      localStorage.setItem("token", data.token);
      auth.updateUser({ userId: data.userId });
    } catch (err) {
      console.error("Failed to change ID:", err.message);
    } finally {
      setChangingId(false);
    }
  }

  function isOnline(userId) {
    return socket.onlineUsers().has(userId);
  }

  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  const isHomeActive = () => location.pathname === "/home";
  const isContactsActive = () => location.pathname === "/contacts";
  const isCreateGroupActive = () => location.pathname === "/create-group";

  return (
    <div class="w-[300px] min-w-[300px] h-full bg-white border-r border-slate-200 flex flex-col">
      <div class="p-4 border-b border-slate-200">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span class="text-lg font-semibold text-slate-900">Chat</span>
        </div>

        <div class="bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">ID</p>
          </div>
          <p class="text-2xl font-bold tracking-[0.15em] text-slate-900 font-mono">{auth.user()?.userId}</p>
          <p class="text-xs text-slate-500 mt-0.5">{auth.user()?.username}</p>
          <button
            onClick={handleChangeId}
            disabled={changingId()}
            class="mt-2 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            {changingId() ? "Generating..." : "Change ID"}
          </button>
        </div>
      </div>

      <div class="flex gap-1.5 p-3 pb-0">
        <button
          onClick={() => navigate("/home")}
          class={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            isHomeActive()
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => navigate("/contacts")}
          class={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            isContactsActive()
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Find people
        </button>
        <button
          onClick={() => navigate("/create-group")}
          class={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            isCreateGroupActive()
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Groups
        </button>
      </div>

      <div class="flex-1 flex flex-col min-h-0 mt-3">
        <div class="px-4 pb-2">
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Messages</p>
        </div>
        <div class="flex-1 overflow-y-auto px-2 space-y-0.5">
          <For each={conversations()}>
            {(conv) => (
              <button
                onClick={() => navigate(`/dm/${conv.user.userId}`)}
                class="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <div class="relative shrink-0">
                  <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <span class="text-xs font-semibold text-slate-600">
                      {conv.user.username[0]?.toUpperCase()}
                    </span>
                  </div>
                  <Show when={isOnline(conv.user._id)}>
                    <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </Show>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-900 truncate">{conv.user.username}</span>
                    <Show when={conv.lastMessage}>
                      <span class="text-[10px] text-slate-400 ml-1.5 shrink-0">{formatTime(conv.lastMessage.timestamp)}</span>
                    </Show>
                  </div>
                  <Show when={conv.lastMessage} fallback={
                    <p class="text-xs text-slate-400 mt-0.5">New conversation</p>
                  }>
                    <p class="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage.sender === auth.user()?._id ? "You: " : ""}
                      {conv.lastMessage.content}
                    </p>
                  </Show>
                </div>
              </button>
            )}
          </For>
          <Show when={conversations().length === 0}>
            <p class="text-xs text-slate-400 px-3 py-3 text-center">No conversations yet</p>
          </Show>
        </div>

        <div class="px-4 pt-3 pb-2 border-t border-slate-100 mt-2">
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Groups</p>
        </div>
        <div class="overflow-y-auto px-2 space-y-0.5 pb-3" style="max-height: 200px;">
          <For each={groups()}>
            {(g) => (
              <button
                onClick={() => navigate(`/group/${g.groupId}`)}
                class="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900 truncate">{g.name}</p>
                    <p class="text-xs text-slate-400">{g.memberCount} members</p>
                  </div>
                </div>
              </button>
            )}
          </For>
          <Show when={groups().length === 0}>
            <p class="text-xs text-slate-400 px-3 py-2 text-center">No groups yet</p>
          </Show>
        </div>
      </div>

      <div class="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          class="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
