import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = createSignal(true);
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin()) {
        await auth.login(username(), password());
      } else {
        await auth.register(username(), password());
      }
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="min-h-screen bg-white">
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
      </nav>

      <div class="flex items-center justify-center px-4" style="min-height: calc(100vh - 73px);">
        <div class="w-full max-w-sm">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-900 mb-2">
              {isLogin() ? "Welcome back" : "Create an account"}
            </h1>
            <p class="text-sm text-slate-500">
              {isLogin()
                ? "Sign in to continue chatting"
                : "Pick a username and get started"}
            </p>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="e.g. johndoe"
                  value={username()}
                  onInput={(e) => setUsername(e.target.value)}
                  class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  autofocus
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password()}
                  onInput={(e) => setPassword(e.target.value)}
                  class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>

              <Show when={error()}>
                <p class="text-sm text-red-500 text-center">{error()}</p>
              </Show>

              <button
                type="submit"
                disabled={loading()}
                class="w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading() ? "Please wait..." : isLogin() ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>

          <p class="mt-4 text-center text-sm text-slate-500">
            {isLogin() ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin((p) => !p);
                setError("");
              }}
              class="text-slate-900 font-medium hover:underline focus:outline-none"
            >
              {isLogin() ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
