export const authRoles = {
  donor: "donor",
  volunteer: "volunteer",
  recipientPartner: "recipientPartner",
  admin: "admin",
};

export const defaultAuthRole = authRoles.donor;

export const authRoleOptions = [
  authRoles.donor,
  authRoles.volunteer,
  authRoles.recipientPartner,
  authRoles.admin,
];

export function isValidAuthRole(role) {
  return authRoleOptions.includes(role);
}
