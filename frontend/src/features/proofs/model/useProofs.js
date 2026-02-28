import { useContext } from "react";
import { ProofContext } from "./ProofContext.jsx";

export function useProofs() {
  const context = useContext(ProofContext);

  if (!context) {
    throw new Error("useProofs must be used within ProofProvider.");
  }

  return context;
}
