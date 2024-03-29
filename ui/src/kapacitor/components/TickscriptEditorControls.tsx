import React, {Component, ChangeEvent} from 'react'

import TickscriptType from 'src/kapacitor/components/TickscriptType'
import MultiSelectDBDropdown from 'src/shared/components/MultiSelectDBDropdown'
import TickscriptID from 'src/kapacitor/components/TickscriptID'

import {Task} from 'src/types'
import {DBRP} from 'src/types/kapacitor'
import TickscriptNameEditor from './TickscriptNameEditor'

interface DBRPDropdownItem extends DBRP {
  name: string
}

interface Props {
  isNewTickscript: boolean
  onSelectDbrps: (dbrps: DBRP[]) => void
  onChangeType: (type: string) => void
  onChangeID: (e: ChangeEvent<HTMLInputElement>) => void
  onChangeName: (name: string) => void
  task: Task
}

class TickscriptEditorControls extends Component<Props> {
  public render() {
    const {onSelectDbrps, onChangeType, task} = this.props
    return (
      <div className="tickscript-controls">
        {this.tickscriptID}
        {!task.id || task.templateID ? undefined : (
          <div className="tickscript-controls--right">
            <TickscriptType type={task.type} onChangeType={onChangeType} />
            <MultiSelectDBDropdown
              selectedItems={this.addName(task.dbrps)}
              onApply={onSelectDbrps}
              rightAligned={true}
            />
          </div>
        )}
      </div>
    )
  }

  private get tickscriptID() {
    const {isNewTickscript, onChangeID, onChangeName, task} = this.props

    if (isNewTickscript) {
      return <TickscriptID onChangeID={onChangeID} id={task.id} />
    }

    return <TickscriptNameEditor name={this.taskID} onRename={onChangeName} />
  }

  private get taskID() {
    const {
      task: {name, id},
    } = this.props
    if (name) {
      return name
    }
    return id
  }

  private addName = (list: DBRP[]): DBRPDropdownItem[] => {
    const listWithName = list.map(l => ({...l, name: `${l.db}.${l.rp}`}))
    return listWithName
  }
}

export default TickscriptEditorControls
