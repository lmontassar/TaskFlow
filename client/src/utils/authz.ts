const PERMISSIONS = {
  creator: [
    "read:project",
    "edit:project",
    "delete:project",
    "addCollaborator:project",
  ],
  memeber: ["read"],
};

export const hasPermission = (
  userRole: string,
  action: string,
  resource: string
) => {
  const userPermissions = PERMISSIONS[userRole];
  if (!userPermissions) {
    return false; // User role not found
  }
  return userPermissions.includes(`${action}:${resource}`);
};

export default hasPermission;
