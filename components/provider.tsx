'use client'

import {GlobalStateProvider} from "./contextProvider"
const Provider = ({children}) => {
  return (
    <GlobalStateProvider>
      {children}
    </GlobalStateProvider>
  )
}

export default Provider
