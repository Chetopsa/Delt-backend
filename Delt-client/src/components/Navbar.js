import React, { useState, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMenu, IoClose } from 'react-icons/io5';  // Icons for the hamburger menu and close icon
import { requestAuth } from '../utils/requestAuth';



function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState(false);

  const navigate = useNavigate();

  // Toggle the menu on click
  const toggleMenu = () => setIsOpen(!isOpen);

  // logout function
  const logout = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL +'/api/logout', {
        method: 'POST',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // On success, redirect to the login page
        navigate('/login');
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


    
    // const {validated} = useValidation();
    // console.log("protected routes " + validated);
    // // Handle loading state if validation is still being checked

    // if (validated === null) {
    //     return <div>Loading...</div>; // replace with loading ui
    // }
    
    // console.log("validated value right after declaration:  " + validated);

    useLayoutEffect( () => {
      (async () => {
        const validation = await requestAuth();
        // console.log("isValidated: " + isValidated);
        if (validation.isAdmin) {
          setAdmin(true);
        } else {
          setAdmin(false);
        }
      })();
    }, []);

  return (
    <nav className="bg-purple-700 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          Delts Dine
        </Link>

        {/* Hamburger Icon for Mobile */}
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-2xl">
            {isOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex space-x-4">
          <Link
            to="/"
            className="hover:text-purple-300 transition duration-200"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="hover:text-purple-300 transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/menu"
            className="hover:text-purple-300 transition duration-200"
          >
            Menu
          </Link>
          {admin && (
            <Link
              to="/adminDashboard"
              className="hover:text-purple-300 transition duration-200"
            >
              Admin Dashboard
            </Link>
          )}
          
          <button
            onClick={logout}
            className="hover:text-purple-300 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu Links (visible when isOpen is true) */}
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'} bg-purple-700`}>
        <div className="space-y-4 px-4 py-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-lg hover:text-purple-300 transition duration-200"
          >
            Home
          </Link>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block text-lg hover:text-purple-300 transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/menu"
            onClick={() => setIsOpen(false)}
            className="block text-lg hover:text-purple-300 transition duration-200"
          >
            Menu
          </Link>

          {admin && (
            <Link
            to="/adminDashboard"
            onClick={() => setIsOpen(false)}
            className="block text-lg hover:text-purple-300 transition duration-200"
          >
            Admin Panel
          </Link>
          )}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="block text-lg hover:text-purple-300 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
