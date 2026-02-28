export const volunteerAvailability = {
  available: "available",
  assigned: "assigned",
  unavailable: "unavailable",
};

export const assignmentStatuses = {
  assigned: "assigned",
  inProgress: "inProgress",
  completed: "completed",
  canceled: "canceled",
};

export const volunteerAvailabilityOptions = Object.values(
  volunteerAvailability,
);
export const assignmentStatusOptions = Object.values(assignmentStatuses);

export function isValidVolunteerAvailability(availability) {
  return volunteerAvailabilityOptions.includes(availability);
}

export function isValidAssignmentStatus(status) {
  return assignmentStatusOptions.includes(status);
}
