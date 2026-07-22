import { Show, For } from "solid-js";

export function Avatar(props) {
  return (
    <div class={`relative shrink-0 ${props.size === "sm" ? "w-7 h-7" : "w-9 h-9"} rounded-full bg-slate-100 flex items-center justify-center`}>
      <span class={`${props.size === "sm" ? "text-[10px]" : "text-xs"} font-semibold text-slate-600`}>
        {props.name?.[0]?.toUpperCase() || "?"}
      </span>
      <Show when={props.online}>
        <span class={`absolute -bottom-0.5 -right-0.5 ${props.size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"} rounded-full bg-emerald-500 border-2 border-white`}></span>
      </Show>
    </div>
  );
}

export function ReadMarker(props) {
  return (
    <Show when={props.read}>
      <div class="flex items-center gap-1 mt-0.5">
        <svg class="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-[10px] text-blue-500 font-medium">Read</span>
      </div>
    </Show>
  );
}

export function DateSeparator(props) {
  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000 && d.getDate() === now.getDate()) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div class="flex items-center gap-3 py-3">
      <div class="flex-1 h-px bg-slate-200"></div>
      <span class="text-[11px] font-medium text-slate-400">{formatDate(props.timestamp)}</span>
      <div class="flex-1 h-px bg-slate-200"></div>
    </div>
  );
}

export function MessageBubble(props) {
  const isMine = () => props.mine;
  const showSender = () => !isMine() && props.showSenderName;
  const showTimestamp = () => props.showTimestamp;
  const isContinuation = () => props.isContinuation;

  return (
    <div class={`flex ${isMine() ? "justify-end" : "justify-start"} ${isContinuation() ? "mt-0.5" : "mt-3"}`}>
      <div class={`flex items-end gap-2 max-w-[75%] ${isMine() ? "flex-row-reverse" : "flex-row"}`}>
        <Show when={!isMine() && !isContinuation()}>
          <Avatar name={props.senderName} size="sm" online={props.online} />
        </Show>
        <Show when={!isMine() && isContinuation()}>
          <div class="w-7 shrink-0"></div>
        </Show>

        <div class={`flex flex-col ${isMine() ? "items-end" : "items-start"}`}>
          <Show when={showSender()}>
            <p class="text-[11px] font-medium text-slate-500 mb-0.5 ml-1">{props.senderName}</p>
          </Show>
          <div
            class={`px-3.5 py-2 ${
              isMine()
                ? "bg-slate-900 text-white rounded-2xl rounded-br-sm"
                : "bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-bl-sm"
            } ${!showSender() && isContinuation() && isMine() ? "rounded-tr-sm" : ""} ${!showSender() && isContinuation() && !isMine() ? "rounded-tl-sm" : ""}`}
          >
            <p class="text-[13.5px] leading-relaxed whitespace-pre-wrap">{props.content}</p>
          </div>
          <Show when={showTimestamp()}>
            <p class={`text-[10px] text-slate-400 mt-0.5 ${isMine() ? "mr-1" : "ml-1"}`}>
              {props.timestamp}
            </p>
          </Show>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator(props) {
  return (
    <Show when={props.visible}>
      <div class="flex justify-start mt-3">
        <div class="flex items-end gap-2">
          <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <span class="text-[10px] font-semibold text-slate-600">?</span>
          </div>
          <div class="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-bl-sm">
            <div class="flex gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}

export function ChatScroller(props) {
  let scrollerRef;

  function scrollToBottom(smooth = true) {
    if (scrollerRef) {
      scrollerRef.scrollTo({
        top: scrollerRef.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }
  }

  props.onRef?.(scrollToBottom);

  return (
    <div
      ref={scrollerRef}
      class="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
    >
      {props.children}
      <div ref={(el) => {
        if (el && scrollerRef) {
          setTimeout(() => scrollerRef.scrollTo({ top: scrollerRef.scrollHeight, behavior: "instant" }), 50);
        }
      }} />
    </div>
  );
}
