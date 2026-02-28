import { useContext } from "react";
import { AssignmentContext } from "./AssignmentContext.jsx";

export function useAssignments() {
  const context = useContext(AssignmentContext);

  if (!context) {
    throw new Error("useAssignments must be used within AssignmentProvider.");
  }

  return context;
}
