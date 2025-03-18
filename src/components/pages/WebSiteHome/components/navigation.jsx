import React from "react";
import { Link } from "react-router-dom";

export const Navigation = (props) => {
  // Define styles as JavaScript objects
  const navStyle = {
    display: 'flex',
    width: '100%', // Full width
    padding: '0 90px', // Add some horizontal padding
    boxSizing: 'border-box', // Include padding in width calculation
    marginRight: '-65%',
  };

  const navItemStyle = {
    margin: '0 -10px', // Further reduced spacing between nav items
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid"> {/* Use container-fluid for full width */}
        <div className="navbar-header" style={{ position: 'relative' }}>
          <img
            src="./img/MARLIN1.png"
            alt="Logo"
            style={{
              position: 'absolute',
              top: '10px',
              left: '-9px', // Adjusted for better positioning
              width: '90px',
              height: 'auto',
              zIndex: 1000
            }}
          />
          <a
            className="navbar-brand page-scroll"
            href="#page-top"
            style={{ marginLeft: '190px' }} // Adjust margin as needed
          >
            MARLIN AQUATIC CENTER
          </a>
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right" style={navStyle}>
            {/* Existing nav items */}
            <li style={navItemStyle}><a href="#about" className="page-scroll">About</a></li>
            {/* <li style={navItemStyle}><a href="#why-marlin" className="page-scroll">Why Marlin</a></li> */}
            <li style={navItemStyle}><a href="#services" className="page-scroll">Packages</a></li>
            <li style={navItemStyle}><a href="#contact" className="page-scroll">Contact</a></li>
            {/* <li style={navItemStyle}><a href="#review" className="page-scroll">Review</a></li>
            <li style={navItemStyle}><a href="#events" className="page-scroll">Events</a></li> */}
            <li style={navItemStyle}><Link to="/login" className="page-scroll">Login</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
