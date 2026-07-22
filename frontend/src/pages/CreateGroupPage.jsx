import { createSignal, createMemo, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function CreateGroupPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [name, setName] = createSignal("");
  const [memberInput, setMemberInput] = createSignal("");
  const [members, setMembers] = createSignal([]);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  function addMember() {
    const id = memberInput().trim();
    if (!id) return;

    if (!/^\d{5}$/.test(id)) {
      setError("Each ID must be exactly 5 digits.");
      return;
    }
    if (id === auth.user()?.userId) {
      setError("You're already a member — don't add your own ID.");
      return;
    }
    if (members().includes(id)) {
      setError("This ID is already added.");
      return;
    }

    setMembers((prev) => [...prev, id]);
    setMemberInput("");
    setError("");
  }

  function removeMember(id) {
    setMembers((prev) => prev.filter((m) => m !== id));
  }

  function handleMemberKey(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addMember();
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    const groupName = name().trim();
    if (!groupName) {
      setError("Group name is required.");
      return;
    }
    if (members().length === 0) {
      setError("Add at least one member.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.createGroup(groupName, members());
      navigate(`/group/${data.groupId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="flex-1 overflow-y-auto p-8 max-w-xl">
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-900 mb-1">Create Group</h2>
        <p class="text-sm text-slate-500">Start a new group conversation.</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleCreate} class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Group Name</label>
            <input
              type="text"
              placeholder="e.g. Project Chat"
              value={name()}
              onInput={(e) => setName(e.target.value)}
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Members</label>
            <div class="flex">
              <input
                type="text"
                placeholder="Add a 5-digit ID, press Enter"
                value={memberInput()}
                onInput={(e) => setMemberInput(e.target.value)}
                onKeyDown={handleMemberKey}
                class="flex-1 px-3 py-2 rounded-l-lg border border-slate-300 border-r-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={addMember}
                class="px-4 py-2 rounded-r-lg bg-slate-100 border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
              >
                Add
              </button>
            </div>

            <Show when={members().length > 0}>
              <div class="flex flex-wrap gap-2 mt-3">
                <For each={members()}>
                  {(id) => (
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-700">
                      <span class="font-mono text-xs">{id}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(id)}
                        class="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-400 hover:text-white transition-colors leading-none text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <Show when={error()}>
            <p class="text-sm text-red-500">{error()}</p>
          </Show>

          <button
            type="submit"
            disabled={loading()}
            class="w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading() ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
