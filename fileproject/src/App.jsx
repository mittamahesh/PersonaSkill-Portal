import React from 'react'
import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './Components/Header'
import { AuthProvider } from './Components/AuthContext';



const App = () => {
  return (
    <AuthProvider>
      <div>
        <Header />
        <Outlet />
      </div>
    </AuthProvider>

  )
}

export default App
