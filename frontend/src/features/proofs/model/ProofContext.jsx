import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  isValidProofStatus,
  isValidProofType,
} from "./proofConstants.js";
import {
  canTransitionProofStatus,
  getAllowedNextProofStatuses,
} from "./proofAuthorization.js";
import { apiRequest } from "../../../shared/api/httpClient.js";
import { useAuth } from "../../auth/model/useAuth.js";

const ProofContext = createContext(null);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function extractEntityId(entityValue) {
  if (!entityValue) {
    return null;
  }

  if (typeof entityValue === "string") {
    return entityValue;
  }

  if (typeof entityValue === "object" && typeof entityValue.id === "string") {
    return entityValue.id;
  }

  return null;
}

function normalizeProof(rawProof) {
  if (!rawProof || typeof rawProof !== "object") {
    return null;
  }

  const missionId = extractEntityId(rawProof.mission);

  if (
    typeof rawProof.id !== "string" ||
    !missionId ||
    typeof rawProof.proofType !== "string" ||
    typeof rawProof.status !== "string"
  ) {
    return null;
  }

  const submittedBy = rawProof.submittedBy;
  const verifiedBy = rawProof.verifiedBy;

  return {
    id: rawProof.id,
    missionId,
    assignmentId: extractEntityId(rawProof.assignment),
    proofType: rawProof.proofType,
    status: rawProof.status,
    note: typeof rawProof.note === "string" ? rawProof.note : "",
    submittedBy:
      typeof submittedBy === "object" && submittedBy !== null
        ? submittedBy.name || submittedBy.email || submittedBy.id || "Unknown"
        : submittedBy,
    verifiedBy:
      typeof verifiedBy === "object" && verifiedBy !== null
        ? verifiedBy.name || verifiedBy.email || verifiedBy.id || ""
        : verifiedBy,
    submittedAt: rawProof.createdAt,
    updatedAt: rawProof.updatedAt,
  };
}

function ProofProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshProofs = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setProofs([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("/proofs", {
        method: "GET",
        token: accessToken,
      });

      const nextProofs = Array.isArray(response.data)
        ? response.data.map((proof) => normalizeProof(proof)).filter(Boolean)
        : [];

      setProofs(nextProofs);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load proofs.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    refreshProofs();
  }, [refreshProofs]);

  const getProofsByMissionId = useCallback(
    (missionId) => proofs.filter((proof) => proof.missionId === missionId),
    [proofs],
  );

  const getLatestProofByMissionId = useCallback(
    (missionId) => {
      const missionProofs = proofs
        .filter((proof) => proof.missionId === missionId)
        .sort(
          (firstProof, secondProof) =>
            new Date(secondProof.updatedAt).getTime() -
            new Date(firstProof.updatedAt).getTime(),
        );

      return missionProofs[0] ?? null;
    },
    [proofs],
  );

  const getAllowedTransitionsForProofStatus = useCallback(
    (currentStatus, actorRole) =>
      getAllowedNextProofStatuses(currentStatus, actorRole),
    [],
  );

  const submitProof = useCallback(
    async ({ missionId, assignmentId, proofType, note }) => {
      const normalizedMissionId = normalizeText(missionId);
      const normalizedNote = normalizeText(note);

      if (!normalizedMissionId || !isValidProofType(proofType)) {
        return { ok: false, error: "Invalid proof submission payload." };
      }

      if (!accessToken) {
        return { ok: false, error: "Authentication is required." };
      }

      try {
        const response = await apiRequest("/proofs", {
          method: "POST",
          token: accessToken,
          body: {
            missionId: normalizedMissionId,
            assignmentId: normalizeText(assignmentId) || undefined,
            proofType,
            note: normalizedNote,
          },
        });

        const nextProof = normalizeProof(response.data);

        if (!nextProof) {
          return { ok: false, error: "Invalid proof response payload." };
        }

        setProofs((currentProofs) => [nextProof, ...currentProofs]);
        return { ok: true, proof: nextProof };
      } catch (requestError) {
        return {
          ok: false,
          error: requestError?.message || "Unable to submit proof.",
        };
      }
    },
    [accessToken],
  );

  const updateProofStatus = useCallback(
    async ({ proofId, nextStatus, actorRole }) => {
      const normalizedProofId = normalizeText(proofId);

      if (!normalizedProofId || !isValidProofStatus(nextStatus)) {
        return { ok: false, error: "Invalid proof status update request." };
      }

      if (!accessToken) {
        return { ok: false, error: "Authentication is required." };
      }

      const targetProof = proofs.find((proof) => proof.id === normalizedProofId);

      if (!targetProof) {
        return { ok: false, error: "Proof not found." };
      }

      const authorizationResult = canTransitionProofStatus(
        targetProof.status,
        nextStatus,
        actorRole,
      );

      if (!authorizationResult.ok) {
        return { ok: false, error: authorizationResult.error };
      }

      try {
        const response = await apiRequest(`/proofs/${normalizedProofId}/status`, {
          method: "PATCH",
          token: accessToken,
          body: { nextStatus },
        });

        const updatedProof = normalizeProof(response.data);

        if (!updatedProof) {
          return { ok: false, error: "Invalid proof response payload." };
        }

        setProofs((currentProofs) =>
          currentProofs.map((proof) =>
            proof.id === normalizedProofId ? updatedProof : proof,
          ),
        );

        return { ok: true, proof: updatedProof };
      } catch (requestError) {
        return {
          ok: false,
          error: requestError?.message || "Unable to update proof status.",
        };
      }
    },
    [accessToken, proofs],
  );

  const value = useMemo(
    () => ({
      proofs,
      isLoading,
      error,
      refreshProofs,
      getProofsByMissionId,
      getLatestProofByMissionId,
      getAllowedNextProofStatuses: getAllowedTransitionsForProofStatus,
      submitProof,
      updateProofStatus,
    }),
    [
      getAllowedTransitionsForProofStatus,
      getLatestProofByMissionId,
      getProofsByMissionId,
      error,
      isLoading,
      proofs,
      refreshProofs,
      submitProof,
      updateProofStatus,
    ],
  );

  return (
    <ProofContext.Provider value={value}>{children}</ProofContext.Provider>
  );
}

export { ProofContext, ProofProvider };
