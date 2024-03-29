import React, {PureComponent} from 'react'
import {ErrorHandling} from 'src/shared/decorators/errors'
import SlideToggle from 'src/reusable_ui/components/slide_toggle/SlideToggle'
import {ComponentColor, ComponentSize} from 'src/reusable_ui/types'

interface Props {
  isChecked: boolean
  text: string
  subtext?: string
  onChange: (isChecked: boolean) => void
  halfWidth?: boolean
  testId?: string
}

class WizardCheckbox extends PureComponent<Props> {
  public render() {
    const {text, isChecked, subtext, halfWidth, testId} = this.props

    return (
      <div className={'form-group ' + (halfWidth ? 'col-xs-6' : 'col-xs-12')}>
        <div className="form-control-static wizard-checkbox--group">
          <SlideToggle
            color={ComponentColor.Success}
            size={ComponentSize.ExtraSmall}
            active={isChecked}
            onChange={this.onChangeSlideToggle}
            tooltipText={text}
            testId={testId}
          />
          <span
            className="wizard-checkbox--label"
            onClick={this.onChangeSlideToggle}
          >
            {text}
          </span>
          {subtext && (
            <span className="wizard-checkbox--subtext">{subtext}</span>
          )}
        </div>
      </div>
    )
  }

  private onChangeSlideToggle = () => {
    const {onChange, isChecked} = this.props
    onChange(!isChecked)
  }
}

export default ErrorHandling(WizardCheckbox)
