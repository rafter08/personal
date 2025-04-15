"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    toast.info("Logging out...", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })

    setTimeout(() => {
      logout()
      navigate("/")
    }, 1500)
  }

  return (
    <>
      <nav className="bg-gray-900 bg-opacity-90 text-white shadow-lg fixed w-full z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Left Side: Logo and Website Name */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <svg
                  className="h-6 w-6 text-indigo-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xl font-bold">InvestDaily</span>
              </Link>
            </div>

            {/* Center: Greeting */}
            {user && (
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                <span className="text-lg font-semibold">Welcome, {user.name}!</span>
              </div>
            )}

            {/* Right Side: Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Home
              </Link>
              <Link to="/plans" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Plans
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 text-gray-300">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/plans"
                className="block px-4 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plans
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="block w-full text-left px-4 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 text-white transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block px-4 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 rounded-md text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Add Space Below Navbar */}
      <div className="h-16"></div>

      {/* Toast Container */}
      <ToastContainer />
    </>
  )
}

export default Navbar
