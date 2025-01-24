import { Box, Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import LoadingIndicator from "./LoadingIndicator";
import apiClient from "../../services/apiClientService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext";

const ChangePassword = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleSubmit = (values) => {
        const email = sessionStorage.getItem("email");
        setIsLoading(true);
        apiClient.post("/api/Users/resetpassword", {email: email, newPassword: values.confirmPassword}).then((data) =>  {
            setIsLoading(false);
            if(isAuthenticated) {
                navigate("/");
            } else {
                navigate("/login");
            }            
        }).catch((error) => {
            setIsLoading(false);
            toast.error("Error while change password.!", {
                position: "top-right"
            });        
        });
    }

    const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleMouseDownPassword = (event) => event.preventDefault();

    const validationSchema = Yup.object({
        newPassword: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('New Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    return (
        <Box sx={{ display: 'flex', height: isAuthenticated ? '49vh' : '95vh' }}>
            {!isAuthenticated && <Box
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
            </Box>}
            <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Paper elevation={6} sx={{ padding: 4 }}>
                    <Typography variant="h5" pb={3} align="center">
                        Change Password    
                    </Typography>
                    <Formik onSubmit={handleSubmit}  initialValues={{
                            newPassword: '',
                            confirmPassword: '',
                        }}
                        validationSchema={validationSchema}>
                            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                                <Form>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        name="newPassword"
                                        value={values.newPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.newPassword && Boolean(errors.newPassword)}
                                        helperText={touched.newPassword && errors.newPassword}
                                        sx={{ marginBottom: 2 }}
                                        InputProps={{
                                            endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                aria-label="toggle new password visibility"
                                                onClick={handleClickShowNewPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                >
                                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                            ),
                                        }}
                                        />

                                        <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        name="confirmPassword"
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                        helperText={touched.confirmPassword && errors.confirmPassword}
                                        sx={{ marginBottom: 2 }}
                                        InputProps={{
                                            endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                aria-label="toggle confirm password visibility"
                                                onClick={handleClickShowConfirmPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                >
                                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                            ),
                                        }}
                                        />
                                    <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                                        Change Password
                                    </Button>
                                </Form>
                            )}
                    </Formik>
                </Paper>
            </Container>
            <LoadingIndicator isLoading={isLoading}/>
        </Box>
    );
}

export default ChangePassword;