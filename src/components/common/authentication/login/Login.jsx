import React, { useState } from 'react';
import { TextField, Button, Box, Typography, InputAdornment, IconButton, Paper, Container } from '@mui/material';
import { useAuth } from '../AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/apiClientService';
import { toast } from 'react-toastify';
import LoadingIndicator from '../../components/LoadingIndicator';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const users = [
    {
      "id": "c09a605e-4b8b-437a-9b36-158e10304070",
      "name": "Guest"
    },
    {
      "id": "c09a605e-4b8b-437a-9b36-158e10304071",
      "name": "Employee"
    },
    {
      "id": "c09a605e-4b8b-437a-9b36-158e10304072",
      "name": "SuperAdmin"
    },
    {
      "id": "c09a605e-4b8b-437a-9b36-158e10304069",
      "name": "Admin"
    }
  ];

  const handleRole = (id) => {
    const user = users.find((user) => user.id === id);
    if(user?.name === "SuperAdmin") {
      return true;
    }
    return false;
  };
  const handleUserType = (id) => {
    if(id === "a4e1f874-9c36-41aa-8af4-f94615c6c363" || id === "a4e1f874-9c36-41aa-8af4-f94615c6c365") {
      return true;
    }
    return false;
  };

  const handleSubmit = (e) => {
    setError("");
    e.preventDefault();    
    if (email && password) {
      setIsLoading(true);
      apiClient.post("/api/Users/login", {email: email, password: password}).then((data) =>  {
        if(data.temporarypassword !== null) {
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("token", data.token);
          navigate("/changepassword");
        } else {
          let isSuperAdmin = handleRole(data.roleid);
          let isMember = handleUserType(data.usertype);
          let userId = data.id;
          setIsLoading(false);
          login(data.token, isSuperAdmin, isMember, email, userId);
          if(isMember) {
            navigate("/member/dashboard");
          } else {
            navigate("/dashboard");
          }
        }        
      }).catch((error) => {
        setIsLoading(false);
        setError("Error while login, Invalid is username or password!")
        toast.error("Error while login, Invalid is username or password!", {
          position: "top-right"
        });        
      });      
    } else {
      setError('Please fill out both fields');
    }
  };

  // Toggle password visibility
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Box sx={{ display: 'flex', height: '95vh' }}>
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
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper elevation={6} sx={{ padding: 4 }}>
          <Typography variant="h5" pb={3} align="center">
            Login    
          </Typography>
          <Typography variant='subtitle1' align='center' pb={3}>
            Login to continue on Marlin Admin Application
          </Typography>
          {error && <Typography
                color="error"
                variant="body2"
                sx={{ marginBottom: "16px", textAlign: "center" }}
              >{error}</Typography>}
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
      <LoadingIndicator isLoading={isLoading}/>
    </Box>
  );
};

export default Login;