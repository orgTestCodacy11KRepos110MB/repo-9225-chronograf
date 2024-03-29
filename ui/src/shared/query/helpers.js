import moment from 'moment'
import {
  ABSOLUTE,
  INVALID,
  RELATIVE_LOWER,
  RELATIVE_UPPER,
} from 'src/shared/constants/timeRange'
const now = /^now|^:/ // ether now() or variable reference (':dashboardTime:') is present

export const timeRangeType = ({upper, lower}) => {
  if (!upper && !lower) {
    return INVALID
  }

  const isUpperValid =
    upper !== null &&
    upper !== undefined &&
    upper !== '' &&
    (upper === ':upperDashboardTime:' || moment(new Date(upper)).isValid())
  const isLowerValid =
    lower !== null &&
    lower !== undefined &&
    lower !== '' &&
    (lower === ':dashboardTime:' || moment(new Date(lower)).isValid())

  // {lower: <Date>, upper: <Date>}
  if (isLowerValid && isUpperValid) {
    return ABSOLUTE
  }

  // {lower: now - <Duration>, upper: <empty>}
  if (now.test(lower) && !upper) {
    return RELATIVE_LOWER
  }

  // {lower: <Date>, upper: now() - <Duration>}
  if (isLowerValid && now.test(upper)) {
    return RELATIVE_UPPER
  }

  return INVALID
}

export const shiftTimeRange = (timeRange, shift) => {
  const {upper, lower} = timeRange
  const {quantity, unit} = shift
  const trType = timeRangeType(timeRange)
  const duration = `${quantity}${unit}`
  const type = 'shifted'

  switch (trType) {
    case RELATIVE_UPPER:
    case ABSOLUTE: {
      return {
        lower: `${lower} - ${duration}`,
        upper: `${upper} - ${duration}`,
        type,
      }
    }

    case RELATIVE_LOWER: {
      return {
        lower: `${lower} - ${duration}`,
        upper: `now() - ${duration}`,
        type,
      }
    }

    default: {
      return {lower, upper, type: 'unshifted'}
    }
  }
}

const getMomentUnit = unit => {
  switch (unit) {
    case 'ms': {
      return 'milliseconds' // (1 thousandth of a second)
    }

    case 's': {
      return 'seconds'
    }

    case 'm': {
      return 'minute'
    }

    case 'h': {
      return 'hour'
    }

    case 'd': {
      return 'day'
    }

    case 'w': {
      return 'week'
    }

    default: {
      return unit
    }
  }
}

export const shiftDate = (date, quantity, unit) => {
  if (!date && !quantity && !unit) {
    return moment(new Date(date))
  }

  return moment(new Date(date)).add(quantity, getMomentUnit(unit))
}
