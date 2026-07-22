import { useNavigate } from "@solidjs/router";

export default function LearnPage() {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen bg-white flex flex-col">
      <nav class="flex items-center justify-between px-8 py-5 border-b border-slate-100">
        <div
          class="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div class="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span class="text-lg font-semibold text-slate-900">Chat</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/auth")}
            class="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      <div class="flex-1">
        <div class="max-w-3xl mx-auto px-8 py-16">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">About the app</p>
          <h1 class="text-3xl font-bold text-slate-900 mb-4">What is Chat?</h1>
          <p class="text-base text-slate-500 leading-relaxed mb-12">
            Chat is a simple, fast messaging app. You get a 5-digit ID when you sign up.
            Share that ID with anyone and they can start a conversation with you instantly.
            No phone numbers, no email lookup, just a short code.
          </p>

          <div class="space-y-10">
            <section>
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Direct messages</h2>
              <p class="text-sm text-slate-600 leading-relaxed mb-4">
                Enter someone's 5-digit ID on the Contacts page and you can start chatting right away.
                Messages are delivered instantly. You see when the other person is online with a small
                green indicator next to their name.
              </p>
              <div class="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">How to start a DM</p>
                <ol class="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                  <li>Go to <span class="font-medium text-slate-900">Find people</span> in the sidebar.</li>
                  <li>Type the other person's 5-digit ID into the input field.</li>
                  <li>Click <span class="font-medium text-slate-900">Open</span> and you're in the chat.</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Group chats</h2>
              <p class="text-sm text-slate-600 leading-relaxed mb-4">
                Need to talk with more than one person? Create a group, give it a name, and add
                members by their 5-digit IDs. Everyone in the group sees the same conversation.
                Groups appear in your sidebar so you can jump back in anytime.
              </p>
              <div class="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">How to create a group</p>
                <ol class="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                  <li>Click <span class="font-medium text-slate-900">New Group</span> in the sidebar.</li>
                  <li>Enter a group name.</li>
                  <li>Add members by typing their 5-digit IDs and pressing Enter.</li>
                  <li>Click <span class="font-medium text-slate-900">Create Group</span>.</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Your identity</h2>
              <p class="text-sm text-slate-600 leading-relaxed mb-4">
                Every user gets a random 5-digit number as their public ID. This is how people
                find and message you. You can change your ID anytime from the sidebar if you
                want a different one. Changing your ID does not affect your existing conversations.
              </p>
              <div class="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Tips</p>
                <ul class="space-y-2 text-sm text-slate-600">
                  <li class="flex items-start gap-2">
                    <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                    Your ID is shown at the top of your sidebar.
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                    Click <span class="font-medium">Change ID</span> to generate a new one.
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                    Old conversations stay linked to your account regardless of ID changes.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Online status</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                When someone is online, you'll see a small green dot next to their name in the
                inbox, sidebar, and chat header. The status updates in real time as people
                connect and disconnect.
              </p>
            </section>

            <section>
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Built with</h2>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">
                Chat is built on open source tools. The frontend uses SolidJS with Tailwind CSS.
                The backend runs Node.js with Express, MongoDB for storage, and Socket.IO for
                real-time message delivery.
              </p>
              <div class="grid grid-cols-4 gap-3">
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">SolidJS</p>
                  <p class="text-xs text-slate-400 mt-0.5">Frontend</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">Node.js</p>
                  <p class="text-xs text-slate-400 mt-0.5">Backend</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">MongoDB</p>
                  <p class="text-xs text-slate-400 mt-0.5">Database</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">Socket.IO</p>
                  <p class="text-xs text-slate-400 mt-0.5">Real-time</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">Express</p>
                  <p class="text-xs text-slate-400 mt-0.5">API</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">Tailwind</p>
                  <p class="text-xs text-slate-400 mt-0.5">Styling</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">Vite</p>
                  <p class="text-xs text-slate-400 mt-0.5">Build</p>
                </div>
                <div class="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p class="text-sm font-semibold text-slate-900">shadcn/ui</p>
                  <p class="text-xs text-slate-400 mt-0.5">Design</p>
                </div>
              </div>
            </section>
          </div>

          <div class="mt-16 text-center">
            <p class="text-sm text-slate-500 mb-4">Ready to try it?</p>
            <button
              onClick={() => navigate("/auth")}
              class="px-6 py-3 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>

      <footer class="border-t border-slate-200 bg-white">
        <div class="max-w-3xl mx-auto px-8 py-6 flex items-center justify-between">
          <span class="text-sm text-slate-500">
            UI by <span class="font-medium text-slate-700">Opencode</span> &middot; Backend by <span class="font-medium text-slate-700">Nebiou Daniel</span>
          </span>
          <p class="text-xs text-slate-400">Built with open source tools</p>
        </div>
      </footer>
    </div>
  );
}
