import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ContactsPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [dmId, setDmId] = createSignal("");
  const [error, setError] = createSignal("");

  function handleOpenDm() {
    setError("");
    const targetId = dmId().trim();

    if (!targetId || targetId === auth.user()?.userId) {
      setError("Enter a valid ID (not your own).");
      return;
    }
    if (!/^\d{5}$/.test(targetId)) {
      setError("ID must be exactly 5 digits.");
      return;
    }

    navigate(`/dm/${targetId}`);
    setDmId("");
  }

  function isOnline(userId) {
    return socket.onlineUsers().has(userId);
  }

  return (
    <div class="flex-1 overflow-y-auto bg-slate-50">
      <div class="max-w-2xl mx-auto px-6 py-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-slate-900 mb-1">Find people</h1>
          <p class="text-sm text-slate-500">
            Enter someone's 5-digit ID to start a conversation.
          </p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Your ID</p>
          <div class="flex items-center gap-4">
            <div class="bg-slate-50 rounded-lg border border-slate-200 px-5 py-3">
              <p class="text-2xl font-bold tracking-[0.15em] text-slate-900 font-mono">{auth.user()?.userId}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{auth.user()?.username}</p>
              <p class="text-xs text-slate-500">Share this with others so they can find you.</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Open a Direct Message</p>
          <div class="flex">
            <input
              type="text"
              placeholder="Enter 5-digit user ID"
              value={dmId()}
              onInput={(e) => setDmId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOpenDm()}
              maxlength="5"
              class="flex-1 px-4 py-2.5 rounded-l-lg border border-slate-200 border-r-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all bg-slate-50"
            />
            <button
              onClick={handleOpenDm}
              class="px-5 py-2.5 rounded-r-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 transition-all"
            >
              Open
            </button>
          </div>
          <Show when={error()}>
            <p class="text-sm text-red-500 mt-2">{error()}</p>
          </Show>
        </div>
      </div>
    </div>
  );
}
