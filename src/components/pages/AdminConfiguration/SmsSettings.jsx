import React from 'react';
import { TextField, Button, Box, Card, CardContent } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const SmsSettings = () => {

  const initialValues= {
    fiveDaysEarlier: '',
    oneDayBefore: '',
    expiryDay: '',
    oneMonthExpired: '',
    registrationMessage: '',
    registrationSuccessMessage: '',
  };

  const validationSchema = Yup.object({
    fiveDaysEarlier: Yup.string().required('5 Days Earlier Data Required'),
    oneDayBefore: Yup.string().required('1 Day Before Data Required'),
    expiryDay: Yup.string().required('Expiry Day Data Required'),
    oneMonthExpired: Yup.string().required('One Month Expired Data Required'),
    registrationMessage: Yup.string().required('Registration Message Data Required'),
    registrationSuccessMessage: Yup.string().required('Registration Success Message Data Required'),
  });


  const handleSubmit = ({values}) => {

  }

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <h2>SMS Settings</h2>
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
                        name="fiveDaysEarlier"
                        as={TextField}
                        label="5 Days Earlier"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.fiveDaysEarlier && Boolean(errors.fiveDaysEarlier)}
                        helperText={touched.fiveDaysEarlier && errors.fiveDaysEarlier}
                      />  
                    </div>
                    <div className='form-group'>
                      <Field
                        name="oneDayBefore"
                        as={TextField}
                        label="1 Day Before"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.oneDayBefore && Boolean(errors.oneDayBefore)}
                        helperText={touched.oneDayBefore && errors.oneDayBefore}
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="expiryDay"
                        as={TextField}
                        label="Expiry Day"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.expiryDay && Boolean(errors.expiryDay)}
                        helperText={touched.expiryDay && errors.expiryDay}
                      />
                    </div>
                    <div className='form-group'>
                      <Field
                        name="oneMonthExpired"
                        as={TextField}
                        label="One Month Expired"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.oneMonthExpired && Boolean(errors.oneMonthExpired)}
                        helperText={touched.oneMonthExpired && errors.oneMonthExpired}
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="registrationMessage"
                        as={TextField}
                        label="Registration Message"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.registrationMessage && Boolean(errors.registrationMessage)}
                        helperText={touched.registrationMessage && errors.registrationMessage}
                      />
                    </div>
                    <div className='form-group'>
                      <Field
                        name="registrationSuccessMessage"
                        as={TextField}
                        label="Registration Success Message"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={touched.registrationSuccessMessage && Boolean(errors.registrationSuccessMessage)}
                        helperText={touched.registrationSuccessMessage && errors.registrationSuccessMessage}
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

export default SmsSettings;
