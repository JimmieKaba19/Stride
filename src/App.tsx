import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/queryClient";
import { AppLayout } from "./components/layout/AppLayout";
import { useAuthStore } from "./store/useAuthStore";
import { ROUTES } from "./constants";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Goals = lazy(() => import("./pages/Goals/index"));
const NewGoal = lazy(() => import("./pages/Goals/New"));
const GoalDetail = lazy(() => import("./pages/GoalDetail"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Mission = lazy(() => import("./pages/Mission"));
const Review = lazy(() => import("./pages/Review"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const Spinner = () => (
  <div className="h-screen flex items-center justify-center text-surface-300 text-sm">
    Loading…
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
};

const AppRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, profile } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!profile?.onboarded) return <Navigate to={ROUTES.ONBOARDING} replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route
              path={ROUTES.ONBOARDING}
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <AppRoute>
                  <AppLayout />
                </AppRoute>
              }
            >
              <Route
                index
                element={<Navigate to={ROUTES.DASHBOARD} replace />}
              />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.GOALS} element={<Goals />} />
              <Route path={ROUTES.GOAL_NEW} element={<NewGoal />} />
              <Route path={ROUTES.GOAL_DETAIL} element={<GoalDetail />} />
              <Route path={ROUTES.CHECKIN} element={<CheckIn />} />
              <Route path={ROUTES.MISSION} element={<Mission />} />
              <Route path={ROUTES.REVIEW} element={<Review />} />
              <Route path={ROUTES.SETTINGS} element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "text-sm font-medium",
          style: { borderRadius: "12px", padding: "10px 16px" },
          success: { duration: 2500 },
          error: { duration: 4000 },
        }}
      />
    </QueryClientProvider>
  );
}
