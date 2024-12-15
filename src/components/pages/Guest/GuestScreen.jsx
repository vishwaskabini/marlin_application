import React from 'react';
import { Formik, Form, Field } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { Box, Card, CardContent, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';

const GuestScreen = () => {
  const paymentTypeOnline = '22220087-c3c2-4268-a25a-13baa6f3625f';
  const paymentTypeCash = '22220087-c3c2-4268-a25a-13baa6f3625e';
  const propertyid = 'a4e1f874-9c36-41aa-8af4-f94615c6c362';
  const userTypeId = 'a4e1f874-9c36-41aa-8af4-f94615c6c365';
  const userStatusActiveId = 'a4e1f874-9c36-41aa-8af4-f94615c6c371';
  const packageId = '8bbc5302-c668-4635-bcea-f54cf11e230f';

  const initialValues = {
    firstName: '',
    lastName: '',
    contact: '',
    gender: '',
    amount: '',
    paymentType: '',
    transactionId: '',
    numberOfPersons: 1,
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    contact: Yup.string().required('Contact Number is required'),
    gender: Yup.string().required('Gender is required'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive'),
    paymentType: Yup.string().required('Payment Type is required'),
    transactionId: Yup.string().test(
      'transactionIdRequired',
      'Transaction ID is required',
      function(value) {
        const { paymentType } = this.parent;
        if (paymentType === '') {
          return value ? true : this.createError({ path: this.path, message: 'Transaction ID is required' });
        }
        return true;
      }
    ),
    numberOfPersons: Yup.number()
      .required('Number of Persons is required')
      .min(1, 'Number of Persons cannot be less than 1'),
  });

  const handleSubmit = (values, { resetForm }) => {
    var requestData = {
      "usertype": userTypeId,
      "firstname": values.firstName,
      "lastname": values.lastName,
      "primarycontactnumber": values.contact,      
      "userstatusid": userStatusActiveId,
      "registereddate": new Date(),
      "propertyid": propertyid,
      "gender": values.gender
    }

    apiClient.post("/api/Users/create", requestData).then((data) =>  {
      savePayments(values, data, { resetForm });
    }).catch((error) => {
      toast.error("Error while create user" + error, {
        position: "top-right"
      });
    });  
  };

  const savePayments = (values, id, {resetForm}) => {
    var requestData = {
      "userid": id,
      "paymenttype": values.paymentType,
      "amount": values.amount,
      "transactionid": values.transactionId,
      "roundedpayment": values.amount
    }
    apiClient.post("/api/UsersPaymentMappingService/create", requestData).then((data) =>  {
      resetForm();
      toast.success("Guest Created Successfully !", {
        position: "top-right"
      });
    }).catch((error) => {
      toast.error("Error while create payment" + error, {
        position: "top-right"
      });
    });
  }

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <h2>Guest Registration</h2>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                <Form>                  
                  <div className='row'>
                    <div className="form-group">            
                      <Field
                        name="firstName"
                        as={TextField}
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        error={touched.firstName && !!errors.firstName}
                      />
                      {touched.firstName && errors.firstName && (
                        <FormHelperText error>{errors.firstName}</FormHelperText>
                      )}
                    </div>

                    <div className="form-group">
                      <Field
                        name="lastName"
                        as={TextField}
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        error={touched.lastName && !!errors.lastName}
                      />
                      {touched.lastName && errors.lastName && (
                        <FormHelperText error>{errors.lastName}</FormHelperText>
                      )}
                    </div>
                  </div>              

                  <div className='row'>
                    <div className="form-group">
                      <Field
                        name="contact"
                        as={TextField}
                        label="Contact Number"
                        variant="outlined"
                        fullWidth
                        error={touched.contact && !!errors.contact}
                        InputProps={{
                          startAdornment: (<InputAdornment position="start">+91</InputAdornment>)
                        }}
                      />
                      {touched.contact && errors.contact && (
                        <FormHelperText error>{errors.contact}</FormHelperText>
                      )}
                    </div>

                    <div className="form-group">
                      <FormControl fullWidth>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Field
                          name="gender"
                          as={Select}
                          label="Gender"
                          labelId="gender-label"
                          variant="outlined"                      
                          onChange={(e) => setFieldValue("gender", e.target.value)}
                          error={touched.gender && !!errors.gender}
                        >
                          <MenuItem value="">
                            <em>Select Gender</em>
                          </MenuItem>
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Field>
                        <FormHelperText error>{errors.gender}</FormHelperText>
                      </FormControl>                  
                    </div>
                  </div>              

                  <div className='row'>
                    <div className="form-group">
                      <Field
                        name="amount"
                        as={TextField}
                        label="Amount"
                        type="number"
                        variant="outlined"
                        fullWidth
                        error={touched.amount && !!errors.amount}
                      />
                      {touched.amount && errors.amount && (
                        <FormHelperText error>{errors.amount}</FormHelperText>
                      )}
                    </div>

                    <div className="form-group">
                      <FormControl fullWidth>
                        <InputLabel id="paymentType-label">Payment Type</InputLabel>
                        <Field
                          name="paymentType"
                          as={Select}
                          label="Payment Type"
                          labelId="paymentType-label"
                          variant="outlined"                      
                          onChange={(e) => setFieldValue("paymentType", e.target.value)}
                          error={touched.paymentType && !!errors.paymentType}
                        >
                          <MenuItem value="">
                            <em>Select Payment</em>
                          </MenuItem>
                          <MenuItem value={paymentTypeCash}>Cash</MenuItem>
                          <MenuItem value={paymentTypeOnline}>UPI</MenuItem>
                        </Field>
                        <FormHelperText error>{errors.paymentType}</FormHelperText>
                      </FormControl>
                    </div>
                  </div>
                  

                  <div className='row'>
                    {values.paymentType === paymentTypeOnline && (
                      <div className="form-group">
                        <Field
                          name="transactionId"
                          as={TextField}
                          label="Transaction ID"
                          variant="outlined"
                          fullWidth
                          error={touched.transactionId && !!errors.transactionId}
                        />
                        {touched.transactionId && errors.transactionId && (
                        <FormHelperText error>{errors.transactionId}</FormHelperText>
                      )}
                      </div>
                    )}

                    <div className="form-group">
                      <Field
                        name="numberOfPersons"
                        as={TextField}
                        label="Number of Persons"
                        type="number"
                        variant="outlined"
                        fullWidth
                        error={touched.numberOfPersons && !!errors.numberOfPersons}
                        InputProps={{
                          inputProps: { min: 1, max: 10 },
                        }}
                      />
                      {touched.numberOfPersons && errors.numberOfPersons && (
                        <FormHelperText error>{errors.numberOfPersons}</FormHelperText>
                      )}
                    </div>
                  </div>
                  <Box className='row save-btn'>
                    <Button variant="contained" type="submit" color='primary'>Save Changes</Button>
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

export default GuestScreen;