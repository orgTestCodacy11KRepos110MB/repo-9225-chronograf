import React, {PureComponent, ChangeEvent} from 'react'
import _ from 'lodash'

import {ErrorHandling} from 'src/shared/decorators/errors'

interface Props {
  onSearch: (s: string) => void
}
interface State {
  searchTerm: string
}

class SearchBar extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      searchTerm: '',
    }
  }

  public UNSAFE_componentWillMount() {
    const waitPeriod = 300
    this.handleSearch = _.debounce(this.handleSearch, waitPeriod)
  }

  public render() {
    return (
      <div className="search-widget" style={{width: '260px'}}>
        <input
          type="text"
          className="form-control input-sm"
          placeholder="Filter Alerts..."
          onChange={this.handleChange}
          value={this.state.searchTerm}
        />
        <span className="icon search" />
      </div>
    )
  }

  private handleSearch = (): void => {
    this.props.onSearch(this.state.searchTerm)
  }

  private handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value}, this.handleSearch)
  }
}

export default ErrorHandling(SearchBar)
