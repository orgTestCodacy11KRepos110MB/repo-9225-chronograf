import {TimeRange, TimeZones, RefreshRate} from 'src/types'
import {LogsState} from 'src/types/logs'

export interface LocalStorage {
  VERSION: VERSION
  app: App
  dashTimeV1: DashTimeV1
  timeRange: TimeRange
  script: string
  logs: LogsState
  telegrafSystemInterval: string
  hostPageDisabled: boolean
  adminInfluxDB: {
    showUsers: boolean
    showRoles: boolean
  }
}

export type VERSION = string
export type timeRange = TimeRange

export interface App {
  persisted: Persisted
}

export interface DashTimeV1 {
  ranges: DashboardTimeRange[]
  refreshes: Refresh[]
}

export interface Refresh {
  dashboardID: string
  refreshRate: RefreshRate
}

interface DashboardTimeRange {
  dashboardID: string
  defaultGroupBy: string
  format: string
  inputValue: string
  lower: string
  menuOption: string
  seconds: number
  upper: string | null
}

interface Persisted {
  autoRefresh: number
  timeZones: TimeZones
}
