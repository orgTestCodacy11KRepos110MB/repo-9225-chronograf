import React, {PureComponent} from 'react'
import {withRouter, WithRouterProps} from 'react-router'
import {connect, HandleThunkActionCreator} from 'react-redux'
import uuid from 'uuid'

import {updateTagFilterAsync} from 'src/shared/actions/annotations'

import {AnnotationTags, TagFilterType} from 'src/types/annotations'

interface OwnProps {
  tags: AnnotationTags
  params: {
    dashboardID: string
    sourceID: string
  }
}
type RouterProps = WithRouterProps<{
  dashboardID: string
  sourceID: string
}>

interface ReduxStateProps {
  annotationsIndexURL: string
}

interface ReduxDispatchProps {
  onUpdateTagFilterAsync: HandleThunkActionCreator<typeof updateTagFilterAsync>
}
type Props = OwnProps & RouterProps & ReduxStateProps & ReduxDispatchProps

class AnnotationTagsDropdown extends PureComponent<Props> {
  public render() {
    const {tags} = this.props
    const entries = Object.entries(tags)
    const pluralizer = entries.length === 1 ? '' : 's'

    return (
      <div className="annotation-tag-count">
        {entries.length} Tag{pluralizer}
        <div className="annotation-tooltip--tags">
          <div className="annotation-tooltip--tags-list">
            {entries.map(([tagKey, tagValue]) => (
              <span
                key={`${tagKey} = ${tagValue}`}
                onClick={this.handleAddTagFilter(tagKey, tagValue)}
              >
                <strong>{tagKey}:</strong> {tagValue}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  private handleAddTagFilter = (tagKey: string, tagValue: string) => () => {
    const {annotationsIndexURL, onUpdateTagFilterAsync} = this.props
    const {dashboardID} = this.props.params

    const newTagFilter = {
      id: uuid.v4(),
      tagKey,
      tagValue,
      filterType: TagFilterType.Equals,
    }

    onUpdateTagFilterAsync(annotationsIndexURL, dashboardID, newTagFilter)
  }
}

const mstp = (state: any, ownProps: any) => {
  const {sourceID} = ownProps.params
  const source = state.sources.find(s => (s.id = sourceID))

  if (!source) {
    throw new Error('Could not find current source')
  }

  return {
    annotationsIndexURL: source.links.annotations,
  } as ReduxStateProps
}

const mdtp = {
  onUpdateTagFilterAsync: updateTagFilterAsync,
}

export default withRouter(connect(mstp, mdtp)(AnnotationTagsDropdown))
