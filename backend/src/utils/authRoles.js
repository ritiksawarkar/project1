export const authRoles = {
  donor: "donor",
  volunteer: "volunteer",
  recipientPartner: "recipientPartner",
  admin: "admin",
};

export const authRoleOptions = Object.values(authRoles);

export function isValidAuthRole(role) {
  return authRoleOptions.includes(role);
}
