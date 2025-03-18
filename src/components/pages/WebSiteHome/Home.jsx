import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Contact } from "./components/contact";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import { Box } from "@mui/material";
import { useAuth } from "../../common/authentication/AuthContext";

export const scroll = new SmoothScroll('a[href*="#"]', {
    speed: 1000,
    speedAsDuration: true,
  });

const Home = () => {    
    const [landingPageData, setLandingPageData] = useState({});
    const {logout} = useAuth();
  
    useEffect(() => {
        logout();
        setLandingPageData(JsonData);
    }, []);

    return (
        <Box>
            <Navigation />
            <div>
                <Header data={landingPageData.Header} />
                <About data={landingPageData.About} />
                <Services data={landingPageData.Services} />
                <Contact data={landingPageData.Contact} />
            </div>
        </Box>        
    );
}

export default Home;