import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import './Dashboard.css'; // Custom CSS for styling

const Dashboard = () => {
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/cardData.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCardData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="grid">
        {cardData.map((card, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className='card-content'>
              <span className="card-title">{card.title}</span>
              <div className="card-count">{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;