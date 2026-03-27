import { User } from 'oidc-client';

export const guestRole = 'guest';
export const adminRole = 'admin';
export const trainerRole = 'trainer';

export function userIsInRole(user: User, roleName: string) {
  const normalizedRole = roleName.toLowerCase();

  if (user?.profile && user?.profile?.role) {
    if (Array.isArray(user.profile.role)) {
      return (
        user.profile.role.findIndex(
          (userRole) => normalizedRole === userRole.toLowerCase()
        ) > -1
      );
    }
    return user.profile.role.toLowerCase() === normalizedRole;
  }
  return false;
}

export function userIsNotInRole(user: User, roleName: string) {
  return !userIsInRole(user, roleName);
}

export function ableToResetDatabase(user: User) {
  return (
    (userIsInRole(user, adminRole) || userIsInRole(user, trainerRole)) &&
    user.profile.organization_resettable &&
    user.profile.organization_resettable.toLowerCase() === 'true' &&
    user.profile.organization_internal &&
    user.profile.organization_internal.toLowerCase() === 'true'
  );
}

export function userLocations(user: User): { [id: string]: string } {
  if (user.profile && user.profile.locations) {
    const locations = JSON.parse(user.profile.locations);

    return locations;
  }

  return null;
}

export function allowUpdateAttendee(user: User): boolean {
  return (
    user.profile &&
    user.profile['placez-guest-access'] &&
    user.profile['placez-guest-access'].includes('UpdateAttendee')
  );
}

export function allowUpdateLayout(user: User): boolean {
  return (
    user.profile &&
    user.profile['placez-guest-access'] &&
    user.profile['placez-guest-access'].includes('UpdateLayout')
  );
}
