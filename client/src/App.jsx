// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword"; 
import Plans from "./pages/Plans";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();

  const hideNavbarAndFooter =
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/admin" ||
    location.pathname === "/forgot-password" || 
    location.pathname.startsWith("/reset-password") || 
    location.pathname.startsWith("/payment/");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbarAndFooter && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* New route */}
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New route */}
          <Route path="/plans" element={<Plans />} />
          <Route path="/payment/:planId" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
}

export default App;