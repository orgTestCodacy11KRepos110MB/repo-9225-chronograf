import {Template, TemplateValueType, TimeRange} from 'src/types'
import {computeInterval} from 'src/tempVars/utils/replace'
import {
  DEFAULT_DURATION_MS,
  TEMP_VAR_DASHBOARD_TIME,
  TEMP_VAR_UPPER_DASHBOARD_TIME,
} from 'src/shared/constants'
import {extractImports} from 'src/shared/parsing/flux/extractImports'
import {getMinDuration} from 'src/shared/parsing/flux/durations'
import fluxString from './fluxString'

// template variables used since 1.9 (compatible with v2)
export const TIMERANGE_START = 'v.timeRangeStart'
export const TIMERANGE_STOP = 'v.timeRangeStop'
export const WINDOW_PERIOD = 'v.windowPeriod'

const INTERVAL_REGEX = /autoInterval|v\.windowPeriod/g

function templateVariableValue(template: Template): string {
  let value = ''
  if (template.values.length) {
    for (const tmplVal of template.values) {
      if (tmplVal.localSelected) {
        value = tmplVal.value
        break
      }
      if (tmplVal.selected) {
        value = tmplVal.value
      }
    }
  }
  return fluxString(value)
}
function templateVariables(templates: Template[]): string {
  const extras = (templates || [])
    .filter(
      x =>
        x.id !== 'dashtime' &&
        x.id !== 'upperdashtime' &&
        x.id !== 'interval' &&
        x.tempVar.startsWith(':') &&
        x.tempVar.endsWith(':') &&
        x.values
    )
    .map(t => {
      return ` "${t.tempVar.substring(
        1,
        t.tempVar.length - 1
      )}" : ${templateVariableValue(t)} `
    }, '')

  return extras.length ? `${extras.join(',')} ,` : ''
}

function fluxVariables(
  lower: string,
  upper: string,
  extraVars: string,
  interval?: number
): string {
  // dashboardTime, upperDashboardTime and autoInterval are added for bacward compatibility with 1.8.x
  if (interval) {
    return `dashboardTime = ${lower}\nupperDashboardTime = ${upper}\nautoInterval = ${interval}ms\nv = {${extraVars} timeRangeStart: dashboardTime , timeRangeStop: upperDashboardTime , windowPeriod: autoInterval }`
  }
  return `dashboardTime = ${lower}\nupperDashboardTime = ${upper}\nv = {${extraVars} timeRangeStart: dashboardTime , timeRangeStop: upperDashboardTime }`
}

/**
 * Extracts exact time range from `dashboardTime` and `upperDashboardTime` variables or returns undefined.
 */
export function extractExactTimeRange(
  templates: Template[]
): TimeRange | undefined {
  const lower = templates.find(x => x.tempVar === TEMP_VAR_DASHBOARD_TIME)
  const upper = templates.find(x => x.tempVar === TEMP_VAR_UPPER_DASHBOARD_TIME)
  if (!lower || !upper) {
    return undefined
  }

  if (
    lower.values?.[0]?.type === TemplateValueType.TimeStamp &&
    upper.values?.[0]?.type === TemplateValueType.TimeStamp
  ) {
    return {
      lower: lower.values?.[0]?.value,
      upper: upper.values?.[0]?.value,
    }
  }
  return undefined
}

export const renderTemplatesInScript = async (
  script: string,
  timeRange: TimeRange,
  templates: Template[],
  astLink: string
): Promise<string> => {
  let dashboardTime: string
  let upperDashboardTime: string

  if (timeRange.upper) {
    dashboardTime = timeRange.lower
    upperDashboardTime = timeRange.upper
  } else {
    dashboardTime = timeRange.lowerFlux || '-1h'
    upperDashboardTime = new Date().toISOString()
  }

  const {imports, body} = await extractImports(astLink, script)

  const extraVars = templateVariables(templates)
  let variables = fluxVariables(dashboardTime, upperDashboardTime, extraVars)
  let rendered = `${variables}\n\n${body}`

  if (!script.match(INTERVAL_REGEX)) {
    return `${imports}\n\n${rendered}`
  }

  let duration: number

  try {
    duration = await getMinDuration(astLink, rendered)
  } catch (error) {
    console.error(error)
    duration = DEFAULT_DURATION_MS
  }

  const interval = computeInterval(duration)
  variables = fluxVariables(
    dashboardTime,
    upperDashboardTime,
    extraVars,
    interval
  )

  rendered = `${imports}\n\n${variables}\n\n${body}`

  return rendered
}
