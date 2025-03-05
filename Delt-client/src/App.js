import './index.css';
import React, { useEffect, useState} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

import ProtectedRoutes from './utils/ProtectedRoutes'
import Navbar from "./components/Navbar";


// import pages
import Login from './screens/login';
import Home from './screens/home';
import Menu from './screens/menu';
import Unauthorized from './screens/unauthorized';
import AdminDashboard from './screens/adminDashboard';




function App(children) {
  console.log("App.js " + process.env.REACT_APP_BACKENDURL);
  return (
      
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route element={<Login/>} path="/login"/>
            <Route element={<Unauthorized />} path="/unauthorized" />
            <Route element={<ProtectedRoutes/>}>
              <Route element={<Home/>} path="/"/>
              <Route element={<Menu/>} path="/menu"/>
              <Route element={<AdminDashboard/>} path="/adminDashboard"/>
            </Route>
            
          
          </Routes>
        </BrowserRouter>
      
  )
}

export default App
