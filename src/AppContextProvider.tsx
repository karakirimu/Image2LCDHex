import { createContext, useReducer } from "react"
import { PanelProps } from "./Panel"

type property<S, T> = { get: S, set: (action: T) => void}
function useReducerProperty<S, T>(reducerFunc: React.Reducer<S, T>, initValue: S): property<S, T> {
  const [value, dispatch] = useReducer(reducerFunc, initValue)
  return {
    get: value,
    set: (action: T) => dispatch(action)
  }
}

export const Operation = {
  Add: 'add',
  Edit: 'edit',
  Remove: 'remove',
  Clear: 'clear'
} as const;
type Operation = (typeof Operation)[keyof typeof Operation]

export const PanelOperation = {
  New: 'New',
  Hex: 'Hex',
  Direction: 'Direction',
  Width: 'Width',
  Height: 'Height',
  Delimiter: 'Delimiter',
  Invert: 'Invert',
  OtsuMethod: 'OtsuMethod',
} as const;
export type PanelOperation = (typeof PanelOperation)[keyof typeof PanelOperation]

type Lcd = {
  panel: Map<string, PanelProps>
}

type DispatchAction = {
  operation: string,
  panel: {id: string, operation?: PanelOperation, value?: string|number|boolean|PanelProps}
}

type AppContext = {
  context: property<Lcd, DispatchAction>
}

const dataDefault: Lcd = {
  panel: new Map<string, PanelProps>()
}

function reducer(context: Lcd, action: DispatchAction): Lcd {
  // console.log("Reducer")
  switch(action.operation) {
    case Operation.Add:
      context.panel.set(action.panel.id, action.panel.value as PanelProps)
      break
    case Operation.Edit:
      {
        const item = (typeof action.panel.id !== "undefined")? context.panel.get(action.panel.id) : undefined
        switch(action.panel.operation) {
          case PanelOperation.Hex:
            item!.hex = action.panel.value as string
            break
          case PanelOperation.Direction:
            item!.direction = action.panel.value as string
            break
          case PanelOperation.Width:
            item!.width = action.panel.value as number
            break
          case PanelOperation.Height:
            item!.height = action.panel.value as number
            break
          case PanelOperation.Delimiter:
            item!.delimiter = action.panel.value as string
            break
          case PanelOperation.Invert:
            item!.invert = action.panel.value as boolean
            break
          case PanelOperation.OtsuMethod:
            item!.otsuMethod = action.panel.value as boolean
            break
          default:
            break
        }
        return {...context }
      }
    case Operation.Remove:
      context.panel.delete(action.panel.id)
      break
    case Operation.Clear:
      context.panel.clear()
      break
    default:
      break
    }

    return { ...context }
  }

export const AppContext = createContext({} as AppContext)

export default function AppContextProvider(props: { children: React.ReactNode }) {
  const initReducer = useReducerProperty(reducer, dataDefault)

  return (
    <AppContext.Provider value={{ context: initReducer }}>
      {props.children}
    </AppContext.Provider>
  )
}