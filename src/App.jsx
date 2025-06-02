import React from 'react';
import { useState } from 'react'
import reactLogo from './assets/react.svg'

import viteLogo from '/vite.svg'
import './App.css'

import Navbar from './pages/Navbar';
import Home from './pages/Home';
import Footer from './pages/Footer';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';


function App() {
  const navigate = useNavigate();
  const notify = () => toast("Wow so easy!");


  const handleStartQuiz = (topics, vehicle) => {
    navigate("/quiz", {
      state: {
        selectedTopics: topics,
        selectedVehicle: vehicle,
      },
    });
  };

  return (
    <>
   
     <div className=''>
        <Navbar />
        <div className='font-["Roboto Condensed"]'>

        <Home />
        </div>

   
        <Footer />
        <ToastContainer
        position="bottom-right"
        autoClose={500000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
    />
      </div>
   
    </>
  )
}

export default App
