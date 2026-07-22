import { useNavigate } from "@solidjs/router";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen bg-white flex flex-col">
      <nav class="flex items-center justify-between px-8 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span class="text-lg font-semibold text-slate-900">Chat</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            onClick={() => navigate("/auth")}
            class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/auth")}
            class="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      <div class="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <h1 class="text-5xl font-bold text-slate-900 leading-tight mb-6">
          Chat with anyone,
          <br />
          <span class="text-slate-400">instantly.</span>
        </h1>

        <p class="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Simple, fast messaging with direct messages and group chats.
          Share your 5-digit ID and start talking.
        </p>

        <div class="flex items-center justify-center gap-4 mb-20">
          <button
            onClick={() => navigate("/auth")}
            class="px-6 py-3 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Start chatting
          </button>
          <button
            onClick={() => navigate("/learn")}
            class="px-6 py-3 text-sm font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Learn more
          </button>
        </div>

        <div class="grid grid-cols-3 gap-6 text-left">
          <div class="p-6 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 mb-1">Instant delivery</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Messages arrive in real-time with Socket.IO.</p>
          </div>

          <div class="p-6 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 mb-1">Group chats</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Create groups and talk with multiple people at once.</p>
          </div>

          <div class="p-6 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 mb-1">Simple identity</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Get a 5-digit ID. Share it to connect with anyone.</p>
          </div>
        </div>
      </div>

      <div id="about" class="border-t border-slate-100 bg-slate-50">
        <div class="max-w-5xl mx-auto px-8 py-16">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">How it works</h2>
          <p class="text-sm text-slate-500 mb-10">A quick overview of the app and the open source tools behind it.</p>

          <div class="grid grid-cols-2 gap-6 mb-12">
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <h3 class="text-sm font-semibold text-slate-900 mb-3">Getting started</h3>
              <ol class="space-y-2.5 text-sm text-slate-600 list-decimal list-inside">
                <li>Create an account with any username and password.</li>
                <li>You get a unique 5-digit ID.</li>
                <li>Share your ID with someone so they can find you.</li>
                <li>Start chatting instantly.</li>
              </ol>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <h3 class="text-sm font-semibold text-slate-900 mb-3">Key features</h3>
              <ul class="space-y-2.5 text-sm text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Direct messages with any user by their ID.
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Group conversations with multiple members.
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Online status indicators so you know who's around.
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Change your 5-digit ID anytime.
                </li>
              </ul>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-slate-900 mb-2">Built with</h2>
          <p class="text-sm text-slate-500 mb-8">Open source tools and frameworks that power this app.</p>

          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">SolidJS</p>
              <p class="text-xs text-slate-400">Frontend framework</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">Node.js</p>
              <p class="text-xs text-slate-400">Backend runtime</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">MongoDB</p>
              <p class="text-xs text-slate-400">Database</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">Socket.IO</p>
              <p class="text-xs text-slate-400">Real-time transport</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">Express</p>
              <p class="text-xs text-slate-400">API framework</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">Tailwind CSS</p>
              <p class="text-xs text-slate-400">Styling</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">Vite</p>
              <p class="text-xs text-slate-400">Build tool</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p class="text-sm font-semibold text-slate-900 mb-0.5">shadcn/ui</p>
              <p class="text-xs text-slate-400">Design reference</p>
            </div>
          </div>
        </div>
      </div>

      <footer class="border-t border-slate-200 bg-white">
        <div class="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span class="text-sm text-slate-500">
              UI by <span class="font-medium text-slate-700">Opencode</span> &middot; Backend by <span class="font-medium text-slate-700">Nebiou Daniel</span>
            </span>
          </div>
          <p class="text-xs text-slate-400">Built with open source tools</p>
        </div>
      </footer>
    </div>
  );
}
