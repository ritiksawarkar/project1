import {
  createProof,
  deleteProof,
  getProofByIdForActor,
  getProofStatusMetadata,
  listProofs,
  updateProofStatus,
} from "../services/proofService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProofHandler = asyncHandler(async (req, res) => {
  const data = await createProof(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Proof submitted successfully.",
    data,
  });
});

export const listProofsHandler = asyncHandler(async (req, res) => {
  const data = await listProofs(req.query, req.user);

  res.status(200).json({
    success: true,
    message: "Proofs fetched successfully.",
    data,
  });
});

export const getProofByIdHandler = asyncHandler(async (req, res) => {
  const data = await getProofByIdForActor(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Proof fetched successfully.",
    data,
  });
});

export const updateProofStatusHandler = asyncHandler(async (req, res) => {
  const data = await updateProofStatus(
    req.params.id,
    req.body.nextStatus,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: "Proof status updated successfully.",
    data,
  });
});

export const proofStatusMetadataHandler = asyncHandler(async (req, res) => {
  const data = getProofStatusMetadata(req.params.status, req.user.role);

  res.status(200).json({
    success: true,
    message: "Proof status metadata fetched successfully.",
    data,
  });
});

export const deleteProofHandler = asyncHandler(async (req, res) => {
  const data = await deleteProof(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Proof deleted successfully.",
    data,
  });
});
