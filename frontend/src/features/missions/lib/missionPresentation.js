import { missionPriorities } from "../model/missionConstants.js";

export function formatMissionStatus(status) {
  if (typeof status !== "string" || status.length === 0) {
    return "Unknown";
  }

  return status
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
}

export function formatDateTime(isoDate) {
  if (!isoDate) {
    return "—";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export function getPriorityBadgeVariant(priority) {
  if (priority === missionPriorities.high) {
    return "info";
  }

  if (priority === missionPriorities.medium) {
    return "neutral";
  }

  return "success";
}
