import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FrontDeskProvider } from './context/FrontDeskContext'
import { RestaurantProvider } from './context/RestaurantContext'
import { DashboardProvider } from './context/DashboardContext'
import './assets/styles/global.css'
import App from './App.jsx'
import { initZoomPrevention } from './utils/preventZoom'

initZoomPrevention();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FrontDeskProvider>
          <RestaurantProvider>
            <DashboardProvider>
              <App />
            </DashboardProvider>
          </RestaurantProvider>
        </FrontDeskProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
