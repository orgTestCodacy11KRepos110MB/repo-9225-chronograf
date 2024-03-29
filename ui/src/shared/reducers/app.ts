import {combineReducers} from 'redux'

import {
  AUTOREFRESH_DEFAULT,
  SHOW_ANNOTATION_CONTROLS_DEFAULT,
  SHOW_TEMP_VAR_CONTROL_BAR_DEFAULT,
} from 'src/shared/constants'
import {ActionTypes, Action} from 'src/types/actions/app'
import {TimeZones} from 'src/types'
import {AnnotationsDisplaySetting} from 'src/types/annotations'

interface State {
  ephemeral: {
    inPresentationMode: boolean
  }
  persisted: {
    autoRefresh: number
    showTemplateVariableControlBar: boolean
    showAnnotationControls: boolean
    annotationsDisplaySetting: AnnotationsDisplaySetting
    timeZone: TimeZones
  }
}

const initialState: State = {
  ephemeral: {
    inPresentationMode: false,
  },
  persisted: {
    autoRefresh: AUTOREFRESH_DEFAULT,
    showTemplateVariableControlBar: SHOW_TEMP_VAR_CONTROL_BAR_DEFAULT,
    showAnnotationControls: SHOW_ANNOTATION_CONTROLS_DEFAULT,
    annotationsDisplaySetting: AnnotationsDisplaySetting.HideAnnotations,
    timeZone: TimeZones.Local,
  },
}

const {
  ephemeral: initialAppEphemeralState,
  persisted: initialAppPersistedState,
} = initialState

const appEphemeralReducer = (
  state = initialAppEphemeralState,
  action: Action
) => {
  switch (action.type) {
    case ActionTypes.EnablePresentationMode: {
      return {
        ...state,
        inPresentationMode: true,
      }
    }

    case ActionTypes.DisablePresentationMode: {
      return {
        ...state,
        inPresentationMode: false,
      }
    }

    default:
      return state
  }
}

const appPersistedReducer = (
  state = initialAppPersistedState,
  action: Action
) => {
  switch (action.type) {
    case ActionTypes.SetAutoRefresh: {
      return {
        ...state,
        autoRefresh: action.payload.milliseconds,
      }
    }

    case ActionTypes.ToggleTemplateVariableControlBar: {
      const update = !state.showTemplateVariableControlBar
      return {
        ...state,
        showTemplateVariableControlBar: update,
      }
    }

    case ActionTypes.ToggleShowAnnotationControls: {
      const update = !state.showAnnotationControls
      return {
        ...state,
        showAnnotationControls: update,
      }
    }

    case ActionTypes.SetTimeZone: {
      const {timeZone} = action.payload

      return {
        ...state,
        timeZone,
      }
    }
    case 'ADDING_ANNOTATION': {
      return {
        ...state,
        annotationsDisplaySetting:
          AnnotationsDisplaySetting.FilterAnnotationsByTag,
      }
    }
    case 'SET_ANNOTATIONS_DISPLAY_SETTING': {
      return {
        ...state,
        annotationsDisplaySetting: action.payload,
      }
    }
    default:
      return state
  }
}

const appReducer = combineReducers<State>({
  ephemeral: appEphemeralReducer,
  persisted: appPersistedReducer,
})

export default appReducer
