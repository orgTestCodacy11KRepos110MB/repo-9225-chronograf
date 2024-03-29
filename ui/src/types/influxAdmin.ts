export interface UserRole {
  name: string
  users: User[]
  permissions: UserPermission[]
  // UI markers
  isEditing?: boolean
  isNew?: boolean
  hidden?: boolean
  links: {
    self: string
  }
}

export interface UserPermission {
  scope: string
  name?: string
  allowed: string[]
}

export interface User {
  name: string
  roles: UserRole[]
  permissions: UserPermission[]
  links: {
    self: string
  }
  // UI only
  password?: string
  hidden?: boolean
}

export interface RetentionPolicy {
  /** a unique string identifier for the retention policy */
  name: string
  /** the duration (when creating a default retention policy) */
  duration?: string
  /** the replication factor (when creating a default retention policy)*/
  replication?: number
  /** the shard duration (when creating a default retention policy)*/
  shardDuration: string
  /** whether the RP should be the default */
  isDefault: boolean
  /** Links are URI locations related to the retention policy */
  links: {
    self: string
  }
}

export interface Database {
  /** a unique string identifier for the database */
  name: string
  /** the duration (when creating a default retention policy) */
  duration?: string
  /** the replication factor (when creating a default retention policy)*/
  replication?: number
  /** the shard duration (when creating a default retention policy)*/
  shardDuration: string
  /** RPs are the retention policies for a database */
  retentionPolicies: RetentionPolicy[]
  /** Links are URI locations related to the database */
  links: {
    self: string
    retentionPolicies: string
    measurements: string
  }
  /** ui markers  */
  isEditing?: boolean
  deleteCode?: string
}
export interface QueryStat {
  /** query id */
  id: number
  /** database */
  database: string
  /** query string */
  query: string
  /** query status */
  status: string
  /** query duration */
  duration: string
  /** tcpHost was used in older InfluxDBs*/
  tcpHost?: string
}
