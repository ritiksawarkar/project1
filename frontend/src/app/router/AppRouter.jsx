import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "../layout/AppLayout.jsx";
import HomePage from "../../pages/home/ui/HomePage.jsx";
import LoginPage from "../../pages/auth/ui/LoginPage.jsx";
import RegisterPage from "../../pages/auth/ui/RegisterPage.jsx";
import MissionsPage from "../../pages/missions/ui/MissionsPage.jsx";
import CreateMissionPage from "../../pages/missions/ui/CreateMissionPage.jsx";
import MissionDetailPage from "../../pages/missions/ui/MissionDetailPage.jsx";
import AssignmentBoardPage from "../../pages/assignments/ui/AssignmentBoardPage.jsx";
import SubmitProofPage from "../../pages/proofs/ui/SubmitProofPage.jsx";
import ProofReviewPage from "../../pages/proofs/ui/ProofReviewPage.jsx";
import AdminOverviewPage from "../../pages/admin/ui/AdminOverviewPage.jsx";
import NotFoundPage from "../../pages/not-found/ui/NotFoundPage.jsx";
import RequireAuth from "../../features/auth/guards/RequireAuth.jsx";
import RequireRole from "../../features/auth/guards/RequireRole.jsx";
import { routePaths } from "./routePaths.js";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: routePaths.home,
        element: <HomePage />,
      },
      {
        path: routePaths.login,
        element: <LoginPage />,
      },
      {
        path: routePaths.register,
        element: <RegisterPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: routePaths.missions,
            element: <MissionsPage />,
          },
          {
            path: routePaths.missionCreate,
            element: <CreateMissionPage />,
          },
          {
            path: routePaths.missionDetailPattern,
            element: <MissionDetailPage />,
          },
          {
            path: routePaths.proofSubmit,
            element: <SubmitProofPage />,
          },
        ],
      },
      {
        element: <RequireRole role="admin" />,
        children: [
          {
            path: routePaths.assignments,
            element: <AssignmentBoardPage />,
          },
          {
            path: routePaths.admin,
            element: <AdminOverviewPage />,
          },
          {
            path: routePaths.proofReview,
            element: <ProofReviewPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
