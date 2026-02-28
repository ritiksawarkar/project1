import { useContext } from "react";
import { MissionContext } from "./MissionContext.jsx";

export function useMissions() {
  const context = useContext(MissionContext);

  if (!context) {
    throw new Error("useMissions must be used within MissionProvider.");
  }

  return context;
}
