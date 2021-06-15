import React, {FunctionComponent} from 'react'

import LogItemSession from 'src/kapacitor/components/LogItemSession'
import LogItemHTTP from 'src/kapacitor/components/LogItemHTTP'
import LogItemHTTPError from 'src/kapacitor/components/LogItemHTTPError'
import LogItemKapacitorPoint from 'src/kapacitor/components/LogItemKapacitorPoint'
import LogItemKapacitorError from 'src/kapacitor/components/LogItemKapacitorError'
import LogItemKapacitorDebug from 'src/kapacitor/components/LogItemKapacitorDebug'
import LogItemInfluxDBDebug from 'src/kapacitor/components/LogItemInfluxDBDebug'

import {LogItem} from 'src/types/kapacitor'
import LogItemFluxTask from './LogItemFluxTask'

interface Props {
  logItem: LogItem
}

const LogsTableRow: FunctionComponent<Props> = ({logItem}) => {
  if (logItem.service === 'sessions') {
    return <LogItemSession logItem={logItem} />
  }
  if (logItem.service === 'http' && logItem.msg === 'http request') {
    return <LogItemHTTP logItem={logItem} />
  }
  if (logItem.service === 'kapacitor' && logItem.msg === 'point') {
    return <LogItemKapacitorPoint logItem={logItem} />
  }
  if (logItem.service === 'kapacitor' && logItem.msg === 'batch point') {
    return <LogItemKapacitorPoint logItem={logItem} />
  }
  if (logItem.service === 'httpd_server_errors' && logItem.lvl === 'error') {
    return <LogItemHTTPError logItem={logItem} />
  }
  if (logItem.service === 'kapacitor' && logItem.lvl === 'error') {
    return <LogItemKapacitorError logItem={logItem} />
  }
  if (logItem.service === 'kapacitor' && logItem.lvl === 'debug') {
    return <LogItemKapacitorDebug logItem={logItem} />
  }
  if (logItem.service === 'influxdb' && logItem.lvl === 'debug') {
    return <LogItemInfluxDBDebug logItem={logItem} />
  }
  if (logItem.service === 'flux_task') {
    return <LogItemFluxTask logItem={logItem} />
  }

  return (
    <div className="logs-table--row">
      <div className="logs-table--divider">
        <div className={`logs-table--level ${logItem.lvl}`} />
        <div className="logs-table--timestamp">{logItem.ts}</div>
      </div>
      <div className="logs-table--details">
        <div className="logs-table--service">{logItem.service || '--'}</div>
        <div className="logs-table--columns">
          <div className="logs-table--key-values">{logItem.msg || '--'}</div>
        </div>
      </div>
    </div>
  )
}

export default LogsTableRow
