import { body, param, query } from "express-validator";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const authValidators = {
  register: [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 128 }),
    body("role").optional().isString().trim(),
  ],
  login: [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 1, max: 128 }),
  ],
};

export const missionValidators = {
  create: [
    body("title").isString().trim().isLength({ min: 5, max: 160 }),
    body("donor").isString().trim().isLength({ min: 2, max: 120 }),
    body("category").isString().trim().isLength({ min: 1, max: 80 }),
    body("area").isString().trim().isLength({ min: 1, max: 120 }),
    body("priority").optional().isString().trim(),
  ],
  updateStatus: [
    param("id").matches(objectIdPattern),
    body("nextStatus").isString().trim().isLength({ min: 1 }),
  ],
  byId: [param("id").matches(objectIdPattern)],
  statusMetadata: [param("status").isString().trim().isLength({ min: 1 })],
  list: [
    query("status").optional().isString().trim(),
    query("priority").optional().isString().trim(),
    query("area").optional().isString().trim(),
    query("category").optional().isString().trim(),
  ],
};

export const assignmentValidators = {
  listVolunteers: [query("search").optional().isString().trim()],
  create: [
    body("missionId").matches(objectIdPattern),
    body("volunteerId").matches(objectIdPattern),
  ],
  updateStatus: [
    param("id").matches(objectIdPattern),
    body("nextStatus").isString().trim().isLength({ min: 1 }),
  ],
  byId: [param("id").matches(objectIdPattern)],
  statusMetadata: [param("status").isString().trim().isLength({ min: 1 })],
  list: [
    query("status").optional().isString().trim(),
    query("missionId").optional().matches(objectIdPattern),
    query("volunteerId").optional().matches(objectIdPattern),
  ],
};

export const proofValidators = {
  create: [
    body("missionId").matches(objectIdPattern),
    body("assignmentId").optional().matches(objectIdPattern),
    body("proofType").isString().trim().isLength({ min: 1 }),
    body("note").optional().isString().trim().isLength({ max: 500 }),
  ],
  updateStatus: [
    param("id").matches(objectIdPattern),
    body("nextStatus").isString().trim().isLength({ min: 1 }),
  ],
  byId: [param("id").matches(objectIdPattern)],
  statusMetadata: [param("status").isString().trim().isLength({ min: 1 })],
  list: [
    query("status").optional().isString().trim(),
    query("missionId").optional().matches(objectIdPattern),
    query("assignmentId").optional().matches(objectIdPattern),
  ],
};

export const adminValidators = {
  listUsers: [
    query("role").optional().isString().trim(),
    query("isActive").optional().isBoolean(),
    query("search").optional().isString().trim(),
  ],
  updateUserActiveState: [
    param("id").matches(objectIdPattern),
    body("isActive").isBoolean(),
  ],
};
