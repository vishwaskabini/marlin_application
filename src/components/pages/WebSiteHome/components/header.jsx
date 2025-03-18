import React, { useState, useEffect } from "react";

export const Header = (props) => {
  // Array of image URLs
  const images = [
    "https://th.bing.com/th/id/R.cc5978db8ca682aaa38aef8ae0061d9b?rik=jR2OlzQ91OK79A&riu=http%3a%2f%2fmedia.timeout.com%2fimages%2f101611569%2fimage.jpg&ehk=ZN0PU6YL%2bGmDPWbT1qQiZzXtbSAWjavY7aWdSnPYp24%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ac95feee65a26fab5074f283261daacf?rik=c0WYIp065abxPg&riu=http%3a%2f%2fwww.poolandspascene.com%2fwp-stuff%2fuploads%2f2016%2f01%2fSwimming-Pool-Underwater-small.jpg&ehk=EhbLmmSqUIpGzyCQD1pjqIsJ%2fJE%2bGEpufMXworFD5GY%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.cc5978db8ca682aaa38aef8ae0061d9b?rik=jR2OlzQ91OK79A&riu=http%3a%2f%2fmedia.timeout.com%2fimages%2f101611569%2fimage.jpg&ehk=ZN0PU6YL%2bGmDPWbT1qQiZzXtbSAWjavY7aWdSnPYp24%3d&risl=&pid=ImgRaw&r=0",
    "https://www.self-build.co.uk/wp-content/uploads/2018/07/XL-Pools.jpg",
    "https://th.bing.com/th/id/R.ac95feee65a26fab5074f283261daacf?rik=c0WYIp065abxPg&riu=http%3a%2f%2fwww.poolandspascene.com%2fwp-stuff%2fuploads%2f2016%2f01%2fSwimming-Pool-Underwater-small.jpg&ehk=EhbLmmSqUIpGzyCQD1pjqIsJ%2fJE%2bGEpufMXworFD5GY%3d&risl=&pid=ImgRaw&r=0"
  ];

  // State to keep track of current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update the current image index
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [images.length]); // Run effect only when images length changes

  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <img
            src={images[currentImageIndex]}
            alt="Slide Image"
            style={{ 
              width: "100%", // Full width of the container
              height: "900px", // Fixed height for the image
              objectFit: "cover" // Maintain aspect ratio while covering the area
            }}
          />
        </div>
      </div>
    </header>
  );
};