// Libraries
import React, {
  Component,
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  RefObject,
} from 'react'
import classnames from 'classnames'

// Types
import {ComponentStatus, ComponentSize, IconFont} from 'src/reusable_ui/types'

export enum InputType {
  Text = 'text',
  Number = 'number',
  Password = 'password',
  Email = 'email',
}

interface Props {
  value?: string
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  onFocus?: () => void
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  size?: ComponentSize
  icon?: IconFont
  status?: ComponentStatus
  autoFocus?: boolean
  spellCheck?: boolean
  type?: InputType
  widthPixels?: number
  titleText?: string
  disabledTitleText?: string
  customClass?: string
  testId?: string
  autoComplete?: string
}

class Input extends Component<Props> {
  public static defaultProps: Partial<Props> = {
    value: '',
    placeholder: '',
    titleText: '',
    disabledTitleText: 'This input is disabled',
    size: ComponentSize.Small,
    status: ComponentStatus.Default,
    autoFocus: false,
    spellCheck: false,
    type: InputType.Text,
  }

  private inputRef: RefObject<HTMLInputElement>
  private timeoutHandle: ReturnType<typeof setTimeout> | undefined

  constructor(props: Props) {
    super(props)
    this.inputRef = React.createRef()
  }

  public componentDidMount() {
    if (this.props.autoFocus) {
      this.timeoutHandle = setTimeout(() => {
        this.inputRef.current.focus()
        this.timeoutHandle = undefined
      }, 50)
    }
  }
  public componentWillUnmount() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }
  }
  public render() {
    const {
      status,
      type,
      value,
      placeholder,
      autoFocus,
      spellCheck,
      autoComplete,
      onChange,
      onBlur,
      onFocus,
      onKeyPress,
      onKeyUp,
      onKeyDown,
      testId,
    } = this.props
    return (
      <div className={this.className} style={this.containerStyle}>
        <input
          title={this.title}
          type={type}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          className="input-field"
          data-test={testId}
          disabled={status === ComponentStatus.Disabled}
          ref={this.inputRef}
        />
        {this.icon}
        {this.statusIndicator}
      </div>
    )
  }

  private get icon(): JSX.Element {
    const {icon} = this.props

    if (icon) {
      return <span className={`input-icon icon ${icon}`} />
    }

    return null
  }

  private get title(): string {
    const {titleText, disabledTitleText, status} = this.props

    if (status === ComponentStatus.Disabled) {
      return disabledTitleText
    }

    return titleText
  }

  private get statusIndicator(): JSX.Element {
    const {status} = this.props

    if (status === ComponentStatus.Loading) {
      return (
        <>
          <div className="input-status">
            <div className="input-spinner" />
          </div>
          <div className="input-shadow" />
        </>
      )
    }

    if (status === ComponentStatus.Error) {
      return (
        <>
          <span className={`input-status icon ${IconFont.AlertTriangle}`} />
          <div className="input-shadow" />
        </>
      )
    }

    if (status === ComponentStatus.Valid) {
      return (
        <>
          <span className={`input-status icon ${IconFont.Checkmark}`} />
          <div className="input-shadow" />
        </>
      )
    }

    return <div className="input-shadow" />
  }

  private get className(): string {
    const {size, status, icon, customClass} = this.props

    return classnames('input', {
      [`input-${size}`]: size,
      'input--has-icon': icon,
      'input--valid': status === ComponentStatus.Valid,
      'input--error': status === ComponentStatus.Error,
      'input--loading': status === ComponentStatus.Loading,
      'input--disabled': status === ComponentStatus.Disabled,
      [`${customClass}`]: customClass,
    })
  }

  private get containerStyle(): CSSProperties {
    const {widthPixels} = this.props

    if (widthPixels) {
      return {width: `${widthPixels}px`}
    }

    return {width: '100%'}
  }
}

export default Input
