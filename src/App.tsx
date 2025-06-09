import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Submissions from "./pages/Submissions";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Contest Pages
import ContestsListPage from "./pages/ContestsListPage";
import ContestArenaPage from "./pages/ContestArenaPage";
import ContestRankingsPage from "./pages/ContestRankingsPage";
import AdminContestsDashboard from "./pages/AdminContestsDashboard";
import AdminCreateContestPage from "./pages/AdminCreateContestPage";

// Admin Pages
import AdminProblemsPage from "./pages/AdminProblemsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
              <Route path="/problems" element={
                <Layout>
                  <Problems />
                </Layout>
              } />
              <Route path="/problems/:id" element={
                <Layout>
                  <ProtectedRoute>
                    <ProblemDetail />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/submissions" element={
                <Layout>
                  <ProtectedRoute>
                    <Submissions />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/dashboard" element={
                <Layout>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/profile" element={
                <Layout>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </Layout>
              } />
              
              {/* Contest Routes */}
              <Route path="/contests" element={
                <Layout>
                  <ContestsListPage />
                </Layout>
              } />
              <Route path="/contests/:contestId" element={
                <Layout>
                  <ProtectedRoute>
                    <ContestArenaPage />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/contests/:contestId/rankings" element={
                <Layout>
                  <ContestRankingsPage />
                </Layout>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <Layout>
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin/contests" element={
                <Layout>
                  <ProtectedRoute adminOnly>
                    <AdminContestsDashboard />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin/contests/create" element={
                <Layout>
                  <ProtectedRoute adminOnly>
                    <AdminCreateContestPage />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin/problems" element={
                <Layout>
                  <ProtectedRoute adminOnly>
                    <AdminProblemsPage />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin/users" element={
                <Layout>
                  <ProtectedRoute adminOnly>
                    <AdminUsersPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
