import React from 'react'

import {USERS_TABLE} from 'src/admin/constants/tableSizing'

import {User} from 'src/types/influxAdmin'
import {Link} from 'react-router'
import {PERMISSIONS} from 'src/shared/constants'

const ADMIN_STYLES = [
  {
    style: 'admin--not-admin',
    text: 'No',
  },
  {
    style: 'admin--is-admin',
    text: 'Yes',
  },
]

interface Props {
  user: User
  allRoles: any[]
  hasRoles: boolean
  page: string
  userDBPermissions: Array<Record<string, boolean>>
  showRoles: boolean
}

const UserRow = ({
  user,
  allRoles,
  hasRoles,
  page,
  userDBPermissions,
  showRoles,
}: Props) => {
  const adminStyle =
    ADMIN_STYLES[
      +!!user.permissions.find(
        x => x.scope === 'all' && (x.allowed || []).includes('ALL')
      )
    ]

  return (
    <tr data-test={'user-row--' + user.name}>
      <td style={{width: `${USERS_TABLE.colUsername}px`}}>
        <Link to={page}>{user.name}</Link>
      </td>
      {hasRoles && showRoles && (
        <td
          className="admin-table--left-offset"
          title={!allRoles.length ? 'No roles are defined' : ''}
          data-test="roles-granted"
        >
          {user.roles.map((role, i) => (
            <span key={i} className="role-value granted">
              {role.name}
            </span>
          ))}
        </td>
      )}
      {!hasRoles && (
        <td style={{width: `${USERS_TABLE.colAdministrator}px`}}>
          <span className={adminStyle.style}>{adminStyle.text}</span>
        </td>
      )}
      {userDBPermissions.map((perms, i) => (
        <td
          className="admin-table__dbperm"
          key={i}
          data-test="permissions--values"
        >
          <span
            className={`permission-value ${
              perms.READ || perms.ReadData ? 'granted' : 'denied'
            }`}
            title={PERMISSIONS.ReadData.description}
            data-test="read-permission"
          >
            {PERMISSIONS.ReadData.displayName}
          </span>
          <span
            className={`permission-value ${
              perms.WRITE || perms.WriteData ? 'granted' : 'denied'
            }`}
            title={PERMISSIONS.WriteData.description}
            data-test="write-permission"
          >
            {PERMISSIONS.WriteData.displayName}
          </span>
        </td>
      ))}
    </tr>
  )
}

export default UserRow
