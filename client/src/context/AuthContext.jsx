"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      try {
        const decodedToken = jwtDecode(token) 
       const currentTime = Date.now() / 1000

        if (decodedToken.exp < currentTime) {
         localStorage.removeItem("token")
          setUser(null)
        } else {
         setUser(decodedToken.user)

         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        }
      } catch (error) {
        console.error("Error decoding token:", error)
        localStorage.removeItem("token")
      }
    }

    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}
