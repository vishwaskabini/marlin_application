import React from 'react';
import { TextField, Button, Box, Card, CardContent, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const Settings = () => {

  const initialValues = {
    otpTimeout: '',
    homeScreenImage1: null,
    homeScreenImage2: null,
    homeScreenImage3: null,
    contactNumber: '',
    contactAddress: '',
    emailId: '',
    noOfSlots: ''
  }

  const validationSchema = Yup.object({
    otpTimeout: Yup.string().required('OTP Timeout is Required'),
    contactNumber: Yup.string().required('Contact Number is Required'),
    contactAddress: Yup.string().required('Contact Address is Required'),
    emailId: Yup.string().email('Invalid email address').required('Email ID is Required'),
    noOfSlots: Yup.string().required('Number of Slots is Required'),
  });

  const handleSubmit = ({values}) => {

  }


  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Typography variant='h5' className='header-text'>Settings         
          </Typography>
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ touched, errors }) => (
                <Form>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="otpTimeout"
                        as={TextField}
                        label="OTP Timeout"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.otpTimeout && Boolean(errors.otpTimeout)}
                        helperText={touched.otpTimeout && errors.otpTimeout}
                      />
                    </div>
                    <div className='form-group'>
                      <Field
                        name="contactNumber"
                        as={TextField}
                        label="Contact Number"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.contactNumber && Boolean(errors.contactNumber)}
                        helperText={touched.contactNumber && errors.contactNumber}
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="contactAddress"
                        as={TextField}
                        label="Contact Address"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.contactAddress && Boolean(errors.contactAddress)}
                        helperText={touched.contactAddress && errors.contactAddress}
                      />
                    </div>
                    <div className='form-group'>
                      <Field
                        name="emailId"
                        as={TextField}
                        label="Email ID"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.emailId && Boolean(errors.emailId)}
                        helperText={touched.emailId && errors.emailId}
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="noOfSlots"
                        as={TextField}
                        label="Number of Slots"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.noOfSlots && Boolean(errors.noOfSlots)}
                        helperText={touched.noOfSlots && errors.noOfSlots}
                      />
                    </div>
                  </div>
                  <Box className="row save-btn">
                    <Button type="submit" variant="contained" color="primary">
                      Save Changes
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Settings;
