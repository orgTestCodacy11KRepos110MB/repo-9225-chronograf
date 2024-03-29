import {FluxTable} from 'src/types'

const COLUMN_BLACKLIST = new Set([
  '_time',
  'result',
  'table',
  '_start',
  '_stop',
  '',
])

const NUMERIC_DATATYPES = ['double', 'long', 'int', 'float']

interface TableByTime {
  [time: string]: {[columnName: string]: string}
}
interface ParseTablesByTimeResult {
  tablesByTime: TableByTime[]
  allColumnNames: string[]
  nonNumericColumns: string[]
}

const IGNORED_TABLE_KEYS = ['_start', '_stop', '_field']

function fluxTableKey(table: FluxTable, columnName: string): string {
  const name =
    columnName === '_value' && table.groupKey._field
      ? table.groupKey._field
      : columnName
  const groupKeys = Object.entries(table.groupKey).reduce((acc, [k, v]) => {
    if (!IGNORED_TABLE_KEYS.includes(k)) {
      acc.push(`${k === '_measurement' ? 'measurement' : k}=${v}`)
    }
    return acc
  }, [])
  return groupKeys.length ? `${name} ${groupKeys.join(' ')}` : name
}

export const parseTablesByTime = (
  tables: FluxTable[]
): ParseTablesByTimeResult => {
  const allColumnNames = []
  const nonNumericColumns = []

  const tablesByTime = tables
    .map(table => {
      const header = table.data[0] as string[]
      const columnNames: {[k: number]: string} = {}

      for (let i = 0; i < header.length; i++) {
        const columnName = header[i]
        const dataType = table.dataTypes[columnName]

        if (COLUMN_BLACKLIST.has(columnName)) {
          continue
        }

        if (table.groupKey[columnName]) {
          continue
        }

        if (!NUMERIC_DATATYPES.includes(dataType)) {
          nonNumericColumns.push(columnName)
          continue
        }

        const uniqueColumnName = fluxTableKey(table, columnName)

        columnNames[i] = uniqueColumnName
        allColumnNames.push(uniqueColumnName)
      }

      let timeIndex = header.indexOf('_time')

      let isTimeFound = true
      if (timeIndex < 0) {
        timeIndex = header.indexOf('_stop')
        if (timeIndex < 0) {
          return undefined
        }
        isTimeFound = false
      }

      const result = {}
      for (let i = 1; i < table.data.length; i++) {
        const row = table.data[i]
        const timeValue = row[timeIndex]
        let time: string
        if (isTimeFound) {
          time = timeValue.toString()
        } else {
          // _stop and _start have values in date string format instead of number
          time = Date.parse(timeValue as string).toString()
        }
        result[time] = Object.entries(columnNames).reduce(
          (acc, [valueIndex, columnName]) => ({
            ...acc,
            [columnName]: row[valueIndex],
          }),
          {}
        )
      }

      return result
    })
    .filter(x => x !== undefined)

  return {nonNumericColumns, tablesByTime, allColumnNames}
}
