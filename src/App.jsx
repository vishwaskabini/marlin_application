import React, { useState } from "react";
import Box from '@mui/material/Box';
import "./App.css";
import Header from "./components/common/components/Header";
import Sidebar from "./components/common/components/SideBar";
import RoutesComponent from "./components/common/components/RoutesComponent";
import { CssBaseline } from "@mui/material";
import Footer from "./components/common/components/Footer";
import { useAuth } from "./components/common/authentication/AuthContext";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, isMember, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogoClick = () => {
    if(isSuperAdmin) {
      navigate("/");
    } else {
      navigate("/member/dashboard");
    }
  }

  return (    
    <Box>
      <CssBaseline />
      {isAuthenticated && ( <Header onMenuClick={handleMenuClick} onLogoClick={handleLogoClick}/> )}
      <Box sx={{display: "flex"}}>
        {isAuthenticated && (
          (isSuperAdmin || (!isMember && !isSuperAdmin)) && (
            <Sidebar drawerState={isSidebarOpen} />
          )
        )}
        <Box component="main" sx={[{ flexGrow: 1, minHeight: "86vh" }, isAuthenticated ? {p: 3} : {}]}>
          <RoutesComponent/>
        </Box>        
      </Box>
      <Footer/>
      <ToastContainer/>     
    </Box>
  );
};

export default App;