import React, {FC} from 'react'
import {Link} from 'react-router'

import KapacitorRulesTable from 'src/kapacitor/components/KapacitorRulesTable'

import {Source, AlertRule, Kapacitor} from 'src/types'

interface KapacitorRulesProps {
  source: Source
  kapacitor: Kapacitor
  rules: AlertRule[]
  onDelete: (rule: AlertRule) => void
  onChangeRuleStatus: (rule: AlertRule) => void
}

const KapacitorRules: FC<KapacitorRulesProps> = ({
  source,
  kapacitor,
  rules,
  onDelete,
  onChangeRuleStatus,
}) => {
  const builderRules = rules.filter((r: AlertRule) => r.query)
  const builderHeader = `${builderRules.length} Alert Rule${
    builderRules.length === 1 ? '' : 's'
  }`
  const kapacitorLink = `/sources/${source.id}/kapacitors/${kapacitor.id}`

  return (
    <div>
      <div className="panel">
        <div className="panel-heading">
          <h2 className="panel-title">{builderHeader}</h2>
          <Link
            to={`${kapacitorLink}/alert-rules/new`}
            className="btn btn-sm btn-primary"
            style={{marginRight: '4px'}}
          >
            <span className="icon plus" /> Build Alert Rule
          </Link>
        </div>
        <div className="panel-body">
          <KapacitorRulesTable
            kapacitorLink={kapacitorLink}
            rules={builderRules}
            onDelete={onDelete}
            onChangeRuleStatus={onChangeRuleStatus}
          />
        </div>
      </div>
    </div>
  )
}

export default KapacitorRules
