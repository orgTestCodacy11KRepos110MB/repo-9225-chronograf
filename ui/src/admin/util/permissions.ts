import {User, UserPermission, UserRole} from 'src/types/influxAdmin'

/** Record with databases as keys and values being a record of granted permissions or permission changes */
export type PerDBPermissions = Record<string, Record<string, boolean>>

/**
 * ComputePermissions creates a record of permissions per database.
 * @param entity infludb user or role
 * @param isEnterprise enteprise InfluxDB flag means that all-scoped permissions are mapped to an extra '' database.
 */
export function computePermissions(
  user: User | UserRole,
  isEnterprise: boolean
): PerDBPermissions {
  return user.permissions.reduce((acc, perm) => {
    if (!isEnterprise && perm.scope !== 'database') {
      return acc // do not include all permissions in OSS, they have separate administration
    }
    const dbName = perm.name || ''
    const dbPerms = acc[dbName] || (acc[dbName] = {})
    perm.allowed.forEach(x => (dbPerms[x] = true))
    return acc
  }, {})
}

/**
 * ComputePermissionsChange computes changes in permissions
 * after toggling a specific db and permission, having original user permission
 * and a set of already performed changes.
 */
export function computePermissionsChange(
  db: string,
  perm: string,
  userPermissions: PerDBPermissions,
  changedPermissions: PerDBPermissions
): PerDBPermissions {
  const origState = userPermissions[db]?.[perm]
  const {[db]: changedDB, ...otherDBs} = changedPermissions
  if (changedDB === undefined) {
    // no change for the database yet
    return {[db]: {[perm]: !origState}, ...otherDBs}
  }
  const {[perm]: changedPerm, ...otherPerms} = changedDB
  if (changedPerm === undefined) {
    // no change for the permission yet
    return {
      [db]: {[perm]: !origState, ...otherPerms},
      ...otherDBs,
    }
  }
  if (Object.keys(otherPerms).length) {
    // we are reverting what has been already changed,
    // return other changed permissions for this database
    return {
      [db]: otherPerms,
      ...otherDBs,
    }
  }
  // the current database is not changed as a result
  return otherDBs
}

/**
 * ToUserPermissions creates server-side's user permissions
 * out of existing and changed user permissions, optionally
 * appended to supplied user permissions.
 */
export function toUserPermissions(
  userPermissions: PerDBPermissions,
  changedPermissions: PerDBPermissions,
  appendAfter: UserPermission[] = []
): UserPermission[] {
  const newUserPermisssions = {...userPermissions}
  Object.entries(changedPermissions).forEach(([db, perms]) => {
    if (newUserPermisssions[db]) {
      newUserPermisssions[db] = {
        ...newUserPermisssions[db],
        ...perms,
      }
    } else {
      newUserPermisssions[db] = {...perms}
    }
  })
  return Object.entries(newUserPermisssions).reduce((acc, [db, permRecord]) => {
    const allowed = Object.entries(permRecord).reduce(
      (allowedAcc, [perm, use]) => {
        if (use) {
          allowedAcc.push(perm)
        }
        return allowedAcc
      },
      []
    )
    if (allowed.length) {
      acc.push({
        scope: db ? 'database' : 'all',
        name: db || undefined,
        allowed,
      })
    }
    return acc
  }, appendAfter)
}
