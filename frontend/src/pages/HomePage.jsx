import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { api } from "../lib/api";

export default function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [conversations, setConversations] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err.message);
    } finally {
      setLoading(false);
    }
  });

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

  return (
    <div class="flex-1 overflow-y-auto bg-slate-50">
      <div class="max-w-2xl mx-auto px-6 py-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-slate-900 mb-1">
            Welcome back, {auth.user()?.username}
          </h1>
          <p class="text-sm text-slate-500">
            Your conversations appear here.
          </p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Your ID</p>
              <p class="text-2xl font-bold tracking-[0.15em] text-slate-900 font-mono mt-0.5">{auth.user()?.userId}</p>
            </div>
            <button
              onClick={() => navigate("/contacts")}
              class="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              New message
            </button>
          </div>

          <Show when={!loading()} fallback={
            <div class="p-8 text-center">
              <p class="text-sm text-slate-400">Loading conversations...</p>
            </div>
          }>
            <Show when={conversations().length > 0} fallback={
              <div class="p-8 text-center">
                <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-slate-900 mb-1">No conversations yet</p>
                <p class="text-xs text-slate-500 mb-4">Start a conversation by entering someone's ID.</p>
                <button
                  onClick={() => navigate("/contacts")}
                  class="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Find contacts
                </button>
              </div>
            }>
              <For each={conversations()}>
                {(conv) => (
                  <button
                    onClick={() => navigate(`/dm/${conv.user.userId}`)}
                    class="w-full text-left px-4 py-3.5 flex items-center gap-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <div class="relative shrink-0">
                      <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <span class="text-sm font-semibold text-slate-600">
                          {conv.user.username[0]?.toUpperCase()}
                        </span>
                      </div>
                      <Show when={isOnline(conv.user._id)}>
                        <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      </Show>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-0.5">
                        <span class="text-sm font-semibold text-slate-900 truncate">{conv.user.username}</span>
                        <Show when={conv.lastMessage}>
                          <span class="text-[11px] text-slate-400 ml-2 shrink-0">{formatTime(conv.lastMessage.timestamp)}</span>
                        </Show>
                      </div>
                      <div class="flex items-center justify-between">
                        <Show when={conv.lastMessage} fallback={
                          <span class="text-xs text-slate-400">No messages yet</span>
                        }>
                          <p class="text-xs text-slate-500 truncate">
                            <Show when={conv.lastMessage.sender === auth.user()?._id}>
                              <span class="text-slate-400">You: </span>
                            </Show>
                            {conv.lastMessage.content}
                          </p>
                        </Show>
                      </div>
                    </div>
                  </button>
                )}
              </For>
          </Show>
        </Show>
        </div>
      </div>
    </div>
  );
}
