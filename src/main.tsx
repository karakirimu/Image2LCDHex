import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { NextUIProvider } from '@nextui-org/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import AppContextProvider from './AppContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </NextThemesProvider>
    </NextUIProvider>
  </React.StrictMode>
)
