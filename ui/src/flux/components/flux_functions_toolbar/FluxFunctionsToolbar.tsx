// Libraries
import React, {PureComponent} from 'react'

// Components
import TransformToolbarFunctions from 'src/flux/components/flux_functions_toolbar/TransformToolbarFunctions'
import FunctionCategory from 'src/flux/components/flux_functions_toolbar/FunctionCategory'
import SearchBar from 'src/flux/components/flux_functions_toolbar/SearchBar'
import FancyScrollbar from 'src/shared/components/FancyScrollbar'

// Constants
import {FUNCTIONS} from 'src/flux/constants/functions'

// Utils
import {
  TimeMachineContainer,
  TimeMachineContextConsumer,
} from 'src/shared/utils/TimeMachineContext'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import {FluxToolbarFunction} from 'src/types/flux'

interface PassedProps {
  onInsertFluxFunction: (fluxFunction: FluxToolbarFunction) => void
}

interface ConnectedProps {
  script: string
  onUpdateScript: (script: string) => void
}

type Props = PassedProps & ConnectedProps

interface State {
  searchTerm: string
}

class FluxFunctionsToolbar extends PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {searchTerm: ''}
  }

  public render() {
    const {searchTerm} = this.state
    return (
      <div className="flux-functions-toolbar">
        <SearchBar onSearch={this.handleSearch} />
        <FancyScrollbar>
          <div className="flux-functions-toolbar--list">
            <TransformToolbarFunctions
              funcs={FUNCTIONS}
              searchTerm={searchTerm}
            >
              {sortedFunctions => {
                return Object.entries(sortedFunctions).map(
                  ([category, funcs]) => {
                    return (
                      <FunctionCategory
                        key={category}
                        category={category}
                        funcs={funcs}
                        onClickFunction={this.handleClickFunction}
                      />
                    )
                  }
                )
              }}
            </TransformToolbarFunctions>
          </div>
        </FancyScrollbar>
      </div>
    )
  }

  private handleClickFunction = (fluxFunction: FluxToolbarFunction): void => {
    this.props.onInsertFluxFunction(fluxFunction)
  }

  private handleSearch = (searchTerm: string): void => {
    this.setState({searchTerm})
  }
}

const FluxFunctionsToolbar2 = ErrorHandling(FluxFunctionsToolbar)
const ConnectedFluxFunctionsToolbar = (props: PassedProps) => (
  <TimeMachineContextConsumer>
    {(container: TimeMachineContainer) => (
      <FluxFunctionsToolbar2
        {...props}
        script={container.state.draftScript}
        onUpdateScript={container.handleUpdateDraftScript}
      />
    )}
  </TimeMachineContextConsumer>
)

export default ConnectedFluxFunctionsToolbar
