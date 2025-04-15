import React from "react"
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="bg-black/100 text-gray-400 py-8"> 
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between space-y-6 md:space-y-0"> 
          {/* About Section */}
          <div className="w-full md:w-4/12 mb-6 md:mb-0 pr-8"> 
            <h4 className="text-white text-lg font-semibold mb-3">About InvestDaily</h4> 
            <p className="text-gray-400 text-sm leading-relaxed">
              InvestDaily is your trusted platform for consistent daily returns. Join thousands of investors and grow
              your wealth with ease. Start small, earn big, and withdraw on your terms.
            </p>
          </div>

          {/* Quick Links */}
          <div className="w-full md:w-4/12">
            <h4 className="text-white text-lg font-semibold mb-3">Quick Links</h4> 
            <ul className="space-y-1"> 
              <li>
                <a href="/" className="hover:text-white transition duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/plans" className="hover:text-white transition duration-200">
                  Investment Plans
                </a>
              </li>
              <li>
                <a href="/profile" className="hover:text-white transition duration-200">
                  Profile
                </a>
              </li>
              <li>
                <a href="/signin" className="hover:text-white transition duration-200">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/signup" className="hover:text-white transition duration-200">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="w-full md:w-4/12">
            <h4 className="text-white text-lg font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FaFacebookF className="text-2xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FaTwitter className="text-2xl" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FaInstagram className="text-2xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FaLinkedinIn className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4 text-center"> 
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} InvestDaily. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
