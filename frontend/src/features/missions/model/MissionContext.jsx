import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { isValidMissionStatus } from "./missionConstants.js";
import {
  canTransitionMissionStatus,
  getAllowedNextStatuses,
} from "./missionAuthorization.js";
import { apiRequest } from "../../../shared/api/httpClient.js";
import { useAuth } from "../../auth/model/useAuth.js";

const MissionContext = createContext(null);

function normalizeMission(rawMission) {
  if (!rawMission || typeof rawMission !== "object") {
    return null;
  }

  const createdBy = rawMission.createdBy;

  return {
    id: rawMission.id,
    title: rawMission.title,
    donor: rawMission.donor,
    category: rawMission.category,
    area: rawMission.area,
    priority: rawMission.priority,
    status: rawMission.status,
    createdBy:
      typeof createdBy === "object" && createdBy !== null
        ? createdBy.name || createdBy.email || createdBy.id || "Unknown"
        : createdBy,
    createdByUser:
      typeof createdBy === "object" && createdBy !== null ? createdBy : null,
    createdAt: rawMission.createdAt,
    updatedAt: rawMission.updatedAt,
  };
}

function MissionProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshMissions = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setMissions([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("/missions", {
        method: "GET",
        token: accessToken,
      });

      const nextMissions = Array.isArray(response.data)
        ? response.data.map((mission) => normalizeMission(mission)).filter(Boolean)
        : [];

      setMissions(nextMissions);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load missions.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    refreshMissions();
  }, [refreshMissions]);

  const getMissionById = useCallback(
    (missionId) => missions.find((mission) => mission.id === missionId) ?? null,
    [missions],
  );

  const createMission = useCallback(
    async (payload) => {
      if (!accessToken) {
        return { ok: false, error: "Authentication is required." };
      }

      try {
        const response = await apiRequest("/missions", {
          method: "POST",
          token: accessToken,
          body: {
            title: payload?.title,
            donor: payload?.donor,
            category: payload?.category,
            area: payload?.area,
            priority: payload?.priority,
          },
        });

        const nextMission = normalizeMission(response.data);

        if (!nextMission) {
          return { ok: false, error: "Invalid mission response payload." };
        }

        setMissions((currentMissions) => [nextMission, ...currentMissions]);
        return { ok: true, mission: nextMission };
      } catch (requestError) {
        return {
          ok: false,
          error: requestError?.message || "Unable to create mission.",
        };
      }
    },
    [accessToken],
  );

  const updateMissionStatus = useCallback(
    async (missionId, nextStatus, actorRole) => {
      if (!missionId || !isValidMissionStatus(nextStatus)) {
        return { ok: false, error: "Invalid mission status update request." };
      }

      if (!accessToken) {
        return { ok: false, error: "Authentication is required." };
      }

      const currentMission = missions.find((mission) => mission.id === missionId);

      if (currentMission) {
        const authorizationResult = canTransitionMissionStatus(
          currentMission.status,
          nextStatus,
          actorRole,
        );

        if (!authorizationResult.ok) {
          return { ok: false, error: authorizationResult.error };
        }
      }

      try {
        const response = await apiRequest(`/missions/${missionId}/status`, {
          method: "PATCH",
          token: accessToken,
          body: { nextStatus },
        });

        const updatedMission = normalizeMission(response.data);

        if (!updatedMission) {
          return { ok: false, error: "Invalid mission response payload." };
        }

        setMissions((currentMissions) =>
          currentMissions.map((mission) =>
            mission.id === missionId ? updatedMission : mission,
          ),
        );

        return { ok: true, mission: updatedMission };
      } catch (requestError) {
        return {
          ok: false,
          error: requestError?.message || "Unable to update mission status.",
        };
      }
    },
    [accessToken, missions],
  );

  const value = useMemo(
    () => ({
      missions,
      isLoading,
      error,
      refreshMissions,
      getMissionById,
      getAllowedNextStatuses,
      createMission,
      updateMissionStatus,
    }),
    [
      createMission,
      error,
      getMissionById,
      isLoading,
      missions,
      refreshMissions,
      updateMissionStatus,
    ],
  );

  return (
    <MissionContext.Provider value={value}>{children}</MissionContext.Provider>
  );
}

export { MissionContext, MissionProvider };
