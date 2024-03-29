import _ from 'lodash'

import AJAX from 'src/utils/ajax'
import {Source, SchemaFilter, TimeRange} from 'src/types'
import fluxString from 'src/flux/helpers/fluxString'
import parseValuesColumn, {
  parseFieldsByMeasurements,
} from 'src/shared/parsing/flux/values'
import rangeArguments from 'src/flux/helpers/rangeArguments'

export const fetchMeasurements = async (
  source: Source,
  timeRange: TimeRange,
  bucket: string
): Promise<string[]> => {
  return fetchTagValues({
    bucket,
    source,
    tagKey: '_measurement',
    limit: 0,
    timeRange,
  })
}

// Fetch all the fields and their associated measurement
export const fetchFieldsByMeasurement = async (
  source: Source,
  timeRange: TimeRange,
  bucket: string
): Promise<{
  fields: string[]
  fieldsByMeasurements: {[measurement: string]: string[]}
}> => {
  const script = `
  from(bucket:${fluxString(bucket)})
    |> range(${rangeArguments(timeRange)})
    |> group(columns: ["_field", "_measurement"], mode: "by")
    |> distinct(column: "_field")
    |> group()
    |> map(fn: (r) => ({_measurement: r._measurement, _field: r._field}))
  `
  const response = await proxy(source, script)
  return parseFieldsByMeasurements(response)
}

export const fetchTagKeys = async (
  source: Source,
  timeRange: TimeRange,
  bucket: string
): Promise<string[]> => {
  const script = `
from(bucket:${fluxString(bucket)}) 
  |> range(${rangeArguments(timeRange)}) 
  |> keys()
  |> keep(columns: ["_value"])
  |> distinct()`

  const response = await proxy(source, script)
  return parseValuesColumn(response)
}

interface TagValuesParams {
  source: Source
  timeRange: TimeRange
  bucket: string
  tagKey: string
  limit: number
  filter?: SchemaFilter[]
  searchTerm?: string
  count?: boolean
}

export const fetchTagValues = async ({
  bucket,
  source,
  tagKey,
  timeRange,
  limit,
  searchTerm = '',
  count = false,
}: TagValuesParams): Promise<string[]> => {
  let regexFilter = ''
  if (searchTerm) {
    regexFilter = `\n  |> filter(fn: (r) => r["_value"] =~ /${searchTerm}/)`
  }

  const limitFunc = count || !limit ? '' : `\n  |> limit(n:${limit})`
  const countFunc = count ? '\n  |> count()' : ''

  const script = `
from(bucket:${fluxString(bucket)})
  |> range(${rangeArguments(timeRange)})
  |> keep(columns: [${fluxString(tagKey)}])
  |> group()
  |> distinct(column: ${fluxString(
    tagKey
  )})${regexFilter}${limitFunc}${countFunc}
  `

  const csvResponse = await proxy(source, script)
  return parseValuesColumn(csvResponse)
}

export const proxy = async (
  source: Source,
  script: string
): Promise<string> => {
  const mark = encodeURIComponent('?')
  const minimizedScript = script.replace(/\s/g, '') // server cannot handle whitespace
  const dialect = {annotations: ['group', 'datatype', 'default']}
  const data = {query: minimizedScript, dialect}
  const base = source.links.flux

  try {
    const response = await AJAX({
      method: 'POST',
      url: `${base}?version=${source.version}&path=/api/v2/query${mark}organization=defaultorgname`,
      data,
      headers: {'Content-Type': 'application/json'},
    })

    return response.data.toString()
  } catch (error) {
    handleError(error)
  }
}

const handleError = error => {
  console.error('Problem fetching data', error)

  throw (
    _.get(error, 'headers.x-influx-error', false) ||
    _.get(error, 'data.message', 'unknown error 🤷')
  )
}
