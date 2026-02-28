import AppRouter from "./router/AppRouter.jsx";
import { AuthProvider } from "../features/auth/model/AuthContext.jsx";
import { MissionProvider } from "../features/missions/model/MissionContext.jsx";
import { AssignmentProvider } from "../features/assignments/model/AssignmentContext.jsx";
import { ProofProvider } from "../features/proofs/model/ProofContext.jsx";

function App() {
  return (
    <AuthProvider>
      <ProofProvider>
        <AssignmentProvider>
          <MissionProvider>
            <AppRouter />
          </MissionProvider>
        </AssignmentProvider>
      </ProofProvider>
    </AuthProvider>
  );
}
export default App;
