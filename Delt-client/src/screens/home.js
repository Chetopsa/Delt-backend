import React, { useEffect, useState, Image } from 'react';
import NameForm from '../components/NameForm';
import { useLocation, useNavigate } from 'react-router-dom';


const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const closeModal = () => {
      setIsModalOpen(false);
      navigate(window.location.pathname);
    }

    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('signUp') === 'true') {
        setIsModalOpen(true);
      }
    }, [location.search]); // will run when query params change
    console.log("Home.js " + process.env.REACT_APP_VAR);
    
    return (

       <>
        <div className="text-center bg-gray-100 p-12 font-sans">
            <h1 className="text-3xl text-gray-800">Welcome to Delts Dine</h1>
            <p className="text-lg text-gray-600 mt-4">Click the Bear to visit the Menu</p>
            <a href="/menu" className="inline-block mt-6 px-6 py-3"> 
              <img src="/DTD_Dine.png" alt="food" width="500" height="500"/>
            </a>
           
        </div>

        
        {isModalOpen && <NameForm closeModal={closeModal}/>}
       </>
    )
}
export default Home;
