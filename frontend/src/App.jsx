import { Show } from "solid-js";
import { Route, Router, Navigate, useLocation } from "@solidjs/router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LearnPage from "./pages/LearnPage";
import AuthPage from "./pages/AuthPage";
import { SocketProvider } from "./context/SocketContext";
import HomePage from "./pages/HomePage";
import ContactsPage from "./pages/ContactsPage";
import DMView from "./pages/DMView";
import GroupView from "./pages/GroupView";
import CreateGroupPage from "./pages/CreateGroupPage";
import Sidebar from "./components/Sidebar";

function ProtectedLayout(props) {
  const auth = useAuth();
  return (
    <Show when={!auth.loading()} fallback={<div class="flex items-center justify-center h-full bg-slate-50"><p class="text-sm text-slate-400">Loading...</p></div>}>
      <Show when={auth.user()} fallback={<Navigate href="/auth" />}>
        <div class="flex h-full bg-slate-50">
          <Sidebar />
          <div class="flex-1 flex flex-col min-w-0">
            {props.children}
          </div>
        </div>
      </Show>
    </Show>
  );
}

function AuthOnly() {
  const auth = useAuth();
  return (
    <Show when={!auth.user()} fallback={<Navigate href="/home" />}>
      <AuthPage />
    </Show>
  );
}

function LandingOrHome() {
  const auth = useAuth();
  return (
    <Show when={!auth.loading()} fallback={<div class="flex items-center justify-center h-full bg-slate-50"><p class="text-sm text-slate-400">Loading...</p></div>}>
      <Show when={auth.user()} fallback={<LandingPage />}>
        <Navigate href="/home" />
      </Show>
    </Show>
  );
}

function HomeLayout() {
  return <ProtectedLayout><HomePage /></ProtectedLayout>;
}

function ContactsLayout() {
  return <ProtectedLayout><ContactsPage /></ProtectedLayout>;
}

function DMLayout() {
  return <ProtectedLayout><DMView /></ProtectedLayout>;
}

function GroupLayout() {
  return <ProtectedLayout><GroupView /></ProtectedLayout>;
}

function CreateGroupLayout() {
  return <ProtectedLayout><CreateGroupPage /></ProtectedLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Route path="/" component={LandingOrHome} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/auth" component={AuthOnly} />
          <Route path="/home" component={HomeLayout} />
          <Route path="/contacts" component={ContactsLayout} />
          <Route path="/dm/:userId" component={DMLayout} />
          <Route path="/group/:groupId" component={GroupLayout} />
          <Route path="/create-group" component={CreateGroupLayout} />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
