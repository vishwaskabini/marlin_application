import React, { useState } from 'react';
import { TextField, Button, Box, Typography, InputAdornment, IconButton, Paper, Container } from '@mui/material';
import { useAuth } from '../AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const token = "dummy-token";

  const handleSubmit = (e) => {
    e.preventDefault();    
    if (email && password) {
      login(token);
      navigate("/");
    } else {
      setError('Please fill out both fields');
    }
  };

  // Toggle password visibility
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Box sx={{ display: 'flex', height: '95vh' }}>
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper elevation={6} sx={{ padding: 4 }}>
          <Typography variant="h5" pb={3} align="center">
            Login    
          </Typography>
          <Typography variant='subtitle1' align='center' pb={3}>
            Login to continue on Marlin Admin Application
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'} // Toggle password type
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ marginBottom: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
          </form>
        </Paper>
      </Container>
      <Box
        sx={{
          width: '30%',
          backgroundColor: "#1976d2",
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 3,
          flexDirection: 'column',
        }}>
        <img src="/img/MARLIN.png" style={{paddingBottom: "2rem"}}/>
        <Typography variant="h6" gutterBottom>
          Welcome to Our App!
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          We are happy to have you! Please log in to continue.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;