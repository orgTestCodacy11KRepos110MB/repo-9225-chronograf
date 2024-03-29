import React, {PureComponent, MouseEvent} from 'react'
import classnames from 'classnames'

import FunctionSelector from 'src/shared/components/FunctionSelector'
import {ErrorHandling} from 'src/shared/decorators/errors'

import {ApplyFuncsToFieldArgs, Field, FieldFunc, FuncArg} from 'src/types'

interface Props {
  fieldName: string
  fieldFuncs: FieldFunc[]
  isSelected: boolean
  onToggleField: (field: Field) => void
  onApplyFuncsToField: (args: ApplyFuncsToFieldArgs) => void
  isKapacitorRule: boolean
  funcs: string[]
  isDisabled: boolean
}

interface State {
  isOpen: boolean
}

class FieldListItem extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
    }
  }

  public render() {
    const {
      isKapacitorRule,
      isSelected,
      fieldName,
      funcs,
      isDisabled,
    } = this.props
    const {isOpen} = this.state

    let fieldFuncsLabel
    const num = funcs.length
    switch (num) {
      case 0:
        fieldFuncsLabel = '0 Functions'
        break
      case 1:
        fieldFuncsLabel = `${num} Function`
        break
      default:
        fieldFuncsLabel = `${num} Functions`
        break
    }
    return (
      <div>
        <div
          className={classnames('query-builder--list-item', {
            active: isSelected,
            disabled: isDisabled,
          })}
          onClick={this.handleToggleField}
          data-test={`query-builder-list-item-field-${fieldName}`}
        >
          <span>
            <div className="query-builder--checkbox" />
            {fieldName}
          </span>
          {isSelected ? (
            <div
              className={classnames('btn btn-xs', {
                active: isOpen,
                'btn-default': !num,
                'btn-primary': num,
                disabled: isDisabled,
              })}
              onClick={this.toggleFunctionsMenu}
              data-test={`query-builder-list-item-function-${fieldName}`}
            >
              {fieldFuncsLabel}
            </div>
          ) : null}
        </div>
        {isSelected && isOpen ? (
          <FunctionSelector
            onApply={this.handleApplyFunctions}
            selectedItems={funcs}
            singleSelect={isKapacitorRule}
          />
        ) : null}
      </div>
    )
  }

  private toggleFunctionsMenu = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const {isDisabled} = this.props
    if (isDisabled) {
      return
    }

    this.setState({isOpen: !this.state.isOpen})
  }

  private close = (): void => {
    this.setState({isOpen: false})
  }

  private handleToggleField = (): void => {
    const {onToggleField, fieldName} = this.props

    onToggleField({value: fieldName, type: 'field'})
    this.close()
  }

  private handleApplyFunctions = (selectedFuncs: string[]) => {
    const {onApplyFuncsToField, fieldName} = this.props
    const field: Field = {value: fieldName, type: 'field'}

    onApplyFuncsToField({
      field,
      funcs: selectedFuncs.map(val => this.makeFuncArg(val)),
    })
    this.close()
  }

  private makeFuncArg = (value: string): FuncArg => ({
    value,
    type: 'func',
  })
}

export default ErrorHandling(FieldListItem)
