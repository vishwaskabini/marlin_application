import React from "react";

export const Services = (props) => {
  const serviceBoxStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    margin: "15px 0",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const imageStyle = {
    maxWidth: "100%",
    height: "auto",
    marginBottom: "15px",
  };

  const titleStyle = {
    marginTop: "15px",
    marginBottom: "10px",
  };

  return (
    <div id="services" style={{ textAlign: "center" }}>
      <div className="container web-container">
        <div className="section-title">
          <h2>Our packages</h2>
          <p>We Have 3 packages: Basic, Advance, and Core.</p>
        </div>
        <div className="row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-md-4">
                  <div style={serviceBoxStyle}>
                    <img src={d.image} alt={d.name} style={imageStyle} />
                    <i className={d.icon}></i>
                    <div className="service-desc">
                      <h3 style={titleStyle}>{d.name}</h3>
                      {d.text.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};