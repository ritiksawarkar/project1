export const missionStatuses = {
  created: "created",
  assigned: "assigned",
  inTransit: "inTransit",
  delivered: "delivered",
  closed: "closed",
};

export const missionPriorities = {
  low: "low",
  medium: "medium",
  high: "high",
};

export const missionStatusOptions = Object.values(missionStatuses);
export const missionPriorityOptions = Object.values(missionPriorities);

export const missionCategories = [
  "Food Kits",
  "Ready Meals",
  "Winter Clothes",
  "School Supplies",
  "Medical Essentials",
  "Hygiene Kits",
];

export function isValidMissionStatus(status) {
  return missionStatusOptions.includes(status);
}

export function isValidMissionPriority(priority) {
  return missionPriorityOptions.includes(priority);
}
