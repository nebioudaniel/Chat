import { createEffect, createSignal, createMemo, For, Show, onCleanup, onMount } from "solid-js";
import { useParams } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { api } from "../lib/api";
import { MessageBubble, DateSeparator } from "../components/ChatComponents";

export default function GroupView() {
  const auth = useAuth();
  const socket = useSocket();
  const params = useParams();

  const groupId = () => params.groupId;
  const threadId = createMemo(() => `group:${groupId()}`);

  const [messages, setMessages] = createSignal([]);
  const [inputVal, setInputVal] = createSignal("");
  const [group, setGroup] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  let scrollerRef;
  let inputRef;

  function scrollToBottom(smooth = true) {
    if (scrollerRef) {
      scrollerRef.scrollTo({
        top: scrollerRef.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function shouldShowDate(msg, index) {
    if (index === 0) return true;
    const prev = messages()[index - 1];
    const prevDate = new Date(prev.timestamp).toDateString();
    const curDate = new Date(msg.timestamp).toDateString();
    return prevDate !== curDate;
  }

  function isContinuation(msg, index) {
    if (index === 0) return false;
    const prev = messages()[index - 1];
    if (prev.sender !== msg.sender) return false;
    const diff = new Date(msg.timestamp) - new Date(prev.timestamp);
    return diff < 60000;
  }

  function shouldShowTimestamp(msg, index) {
    if (index === messages().length - 1) return true;
    const next = messages()[index + 1];
    return next.sender !== msg.sender;
  }

  onMount(async () => {
    try {
      const groups = await api.getGroups();
      const g = groups.find((g) => g.groupId === groupId());
      if (g) {
        setGroup(g);
        const msgs = await api.getMessages(threadId());
        setMessages(msgs);
      }
    } catch {
      console.error("Failed to load group");
    } finally {
      setLoading(false);
    }

    socket.emit("join-group", { groupId: groupId() });
  });

  createEffect(() => {
    const s = socket.socket();
    if (!s) return;

    const handler = ({ threadId: incomingId, message }) => {
      if (incomingId === threadId()) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    s.on("receive-message", handler);
    onCleanup(() => s.off("receive-message", handler));
  });

  createEffect(() => {
    messages();
    setTimeout(() => scrollToBottom(false), 50);
  });

  function sendMessage() {
    const content = inputVal().trim();
    if (!content) return;

    socket.emit("send-message", {
      threadId: threadId(),
      content,
      type: "group",
      groupId: groupId(),
    });

    setInputVal("");
    inputRef?.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div class="flex flex-col h-full bg-slate-50">
      <div class="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <Show when={group()} fallback={<span class="text-sm text-slate-400">Loading...</span>}>
          <div class="flex-1 min-w-0">
            <span class="text-sm font-semibold text-slate-900 truncate block">{group()?.name}</span>
            <p class="text-xs text-slate-400">{group()?.members?.length} members</p>
          </div>
        </Show>
      </div>

      <div ref={scrollerRef} class="flex-1 overflow-y-auto px-5 py-4">
        <Show when={!loading()} fallback={
          <div class="flex items-center justify-center h-full">
            <p class="text-sm text-slate-400">Loading messages...</p>
          </div>
        }>
          <For each={messages()}>
            {(m, index) => {
              const mine = m.sender === auth.user()?._id;
              const showDate = shouldShowDate(m, index());
              const cont = isContinuation(m, index());
              const showTs = shouldShowTimestamp(m, index());

              return (
                <>
                  <Show when={showDate}>
                    <DateSeparator timestamp={m.timestamp} />
                  </Show>
                  <MessageBubble
                    mine={mine}
                    senderName={m.senderName}
                    content={m.content}
                    showSenderName={!mine && !cont}
                    showTimestamp={showTs}
                    isContinuation={cont}
                  />
                </>
              );
            }}
          </For>
          <div style="height: 1px" />
        </Show>
      </div>

      <div class="px-5 py-4 bg-white border-t border-slate-200">
        <div class="flex gap-2.5 items-end max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            placeholder="Type a message..."
            value={inputVal()}
            onInput={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            rows="1"
            class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none bg-slate-50"
            style="min-height: 40px; max-height: 120px;"
          />
          <button
            onClick={sendMessage}
            disabled={!inputVal().trim()}
            class="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
