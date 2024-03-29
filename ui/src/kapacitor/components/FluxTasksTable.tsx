import React, {FC} from 'react'
import _ from 'lodash'

import {FluxTask} from 'src/types'

import ConfirmButton from 'src/shared/components/ConfirmButton'
import {TASKS_TABLE} from 'src/kapacitor/constants/tableSizing'
import {Link} from 'react-router'
const {colName, colEnabled, colActions, colEvery, colCron} = TASKS_TABLE

interface FluxTasksTableProps {
  tasks: FluxTask[]
  kapacitorLink: string
  onChangeTaskStatus: (task: FluxTask) => void
  onDelete: (task: FluxTask) => void
  editLinkSuffix?: string
}

interface FluxTaskRowProps {
  task: FluxTask
  viewLink: string
  onChangeTaskStatus: (rule: FluxTask) => void
  onDelete: (rule: FluxTask) => void
}

const FluxTaskRow: FC<FluxTaskRowProps> = ({
  task,
  viewLink,
  onChangeTaskStatus,
  onDelete,
}) => (
  <tr key={task.id}>
    <td style={{minWidth: colName}}>
      <Link to={viewLink}>{task.name}</Link>
    </td>
    <td style={{width: colEvery}}>{task.every || ''}</td>
    <td style={{width: colCron}}>{task.cron || ''}</td>
    <td style={{width: colEnabled}} className="text-center">
      <div className="dark-checkbox">
        <input
          id={`kapacitor-task-row-task-enabled ${task.id}`}
          className="form-control-static"
          type="checkbox"
          checked={task.status === 'active'}
          onChange={() => onChangeTaskStatus(task)}
        />
        <label htmlFor={`kapacitor-task-row-task-enabled ${task.id}`} />
      </div>
    </td>
    <td style={{width: colActions}} className="text-right">
      <ConfirmButton
        text="Delete"
        type="btn-danger"
        size="btn-xs"
        customClass="table--show-on-row-hover"
        confirmAction={() => onDelete(task)}
      />
    </td>
  </tr>
)

const FluxTasksTable: FC<FluxTasksTableProps> = ({
  tasks,
  kapacitorLink,
  onDelete,
  onChangeTaskStatus,
  editLinkSuffix = '',
}) => {
  if (!tasks) {
    return null
  }
  return (
    <table className="table v-center table-highlight">
      <thead>
        <tr>
          <th style={{minWidth: colName}}>Name</th>
          <th style={{minWidth: colEvery}}>Every</th>
          <th style={{minWidth: colCron}}>Cron</th>
          <th style={{width: colEnabled}} className="text-center">
            Task Active
          </th>
          <th style={{width: colActions}} />
        </tr>
      </thead>
      <tbody>
        {_.sortBy(tasks, t => t.name.toLowerCase()).map(task => {
          return (
            <FluxTaskRow
              key={task.id}
              viewLink={`${kapacitorLink}/fluxtasks/${task.id}${editLinkSuffix}`}
              task={task}
              onDelete={onDelete}
              onChangeTaskStatus={onChangeTaskStatus}
            />
          )
        })}
      </tbody>
    </table>
  )
}

export default FluxTasksTable
