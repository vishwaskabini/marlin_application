import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { Box, Card, CardContent, Dialog, DialogContent, DialogTitle, duration, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import AddIcon from '@mui/icons-material/Add';
import ListTable from '../../common/components/ListTable';

const GuestScreen = () => {  
  const propertyid = 'a4e1f874-9c36-41aa-8af4-f94615c6c362';
  const userTypeId = 'a4e1f874-9c36-41aa-8af4-f94615c6c365';
  const userStatusActiveId = 'a4e1f874-9c36-41aa-8af4-f94615c6c371';
  const packageId = '8bbc5302-c668-4635-bcea-f54cf11e230f';
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);  
  const [guestData, setGuestData] = useState([]);

  const getGuestData = () => {
    setIsLoading(true);
    apiClient.get("/api/Guests").then((data) => {
      setIsLoading(false);
      setGuestData(data);
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    getGuestData();
  },[]);  

  const onDialogClose = () => {
    setIsDialogOpen(false);
  }

  const initialValues = {
    firstname: '',
    lastname: '',
    contactnumber: '',
    gender: '',
    amount: 0,
    duration: 1,
    totalamount: 0,
    paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
    transactionid: '',
    noofpersons: 1,
    registereddate: new Date()
  };

  const handleSubmit = (values) => {
    setIsLoading(true);
    apiClient.post("/api/Guests/create", values).then((data) =>  {
      setIsDialogOpen(false);
      getGuestData();      
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while create guest" + error, {
        position: "top-right"
      });
    });  
  };

  const handleAddGuestDiaglog = () => {
    setIsDialogOpen(true);
  }

  const columns = [
    { id: 'firstname', label: 'First Name' },
    { id: 'lastname', label: 'Last Name' },
    { id: 'contactnumber', label: 'Contact' },
    { id: 'gender', label: 'Gender' },
    { id: 'totalamount', label: 'Total Amount' },
  ];

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Typography variant='h5' className='header-text'>Guest Registration
            <Button variant="contained" sx={{marginLeft: "auto"}} startIcon={<AddIcon />} onClick={handleAddGuestDiaglog}>Add Guest</Button>            
          </Typography>
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <ListTable columns={columns} rows={guestData} tableName="Guest List"/>
          </CardContent>
        </Card>
      </Box>
      <LoadingIndicator isLoading={isLoading}/>
      <CreateGuestDialog open={isDialogOpen} handleClose={onDialogClose}
        initialValues={initialValues} handleFormSubmit={handleSubmit}/>
    </div>
  );
};


const CreateGuestDialog = ({open, handleClose, initialValues, handleFormSubmit}) => {
  const paymentTypeOnline = '22220087-c3c2-4268-a25a-13baa6f3625f';
  const paymentTypeCash = '22220087-c3c2-4268-a25a-13baa6f3625e';

  const validationSchema = Yup.object({
    firstname: Yup.string().required('First Name is required'),
    lastname: Yup.string().required('Last Name is required'),
    contactnumber: Yup.string().required('Contact Number is required'),
    gender: Yup.string().required('Gender is required'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive'),
    totalamount: Yup.number()
      .required('Total Amount is required')
      .positive('Total Amount must be positive'),
    duration: Yup.number()
      .required('Duration is required')
      .positive('Duration must be positive'),
    paymenttype: Yup.string().required('Payment Type is required'),
    transactionid: Yup.string(),
    noofpersons: Yup.number()
      .required('Number of Persons is required')
      .min(1, 'Number of Persons cannot be less than 1')
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{'Add Guest'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue, handleChange }) => (
            <Form>                  
              <div className='row'>
                <div className="form-group">            
                  <Field
                    name="firstname"
                    as={TextField}
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    error={touched.firstname && !!errors.firstname}
                  />
                  {touched.firstname && errors.firstname && (
                    <FormHelperText error>{errors.firstname}</FormHelperText>
                  )}
                </div>

                <div className="form-group">
                  <Field
                    name="lastname"
                    as={TextField}
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    error={touched.lastname && !!errors.lastname}
                  />
                  {touched.lastname && errors.lastname && (
                    <FormHelperText error>{errors.lastname}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="contactnumber"
                    as={TextField}
                    label="Contact Number"
                    variant="outlined"
                    fullWidth
                    error={touched.contactnumber && !!errors.contactnumber}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start">+91</InputAdornment>)
                    }}
                  />
                  {touched.contactnumber && errors.contactnumber && (
                    <FormHelperText error>{errors.contactnumber}</FormHelperText>
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
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
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
                    value={values.amount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setFieldValue('amount', amount);
                      const totalamount = amount * parseInt(values.duration) * parseInt(values.noofpersons);
                      setFieldValue('totalamount', totalamount);
                    }}
                  />
                  {touched.amount && errors.amount && (
                    <FormHelperText error>{errors.amount}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="duration"
                    as={TextField}
                    label="Duration"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={touched.duration && !!errors.duration}
                    value={values.duration}
                    onChange={(e) => {
                      const duration = parseFloat(e.target.value) || 0;
                      setFieldValue('duration', duration);
                      const totalamount = duration * parseInt(values.amount) * parseInt(values.noofpersons);
                      setFieldValue('totalamount', totalamount);
                    }}
                    InputProps={{
                      inputProps: { min: 1, max: 8 },
                    }}
                  />
                  {touched.duration && errors.duration && (
                    <FormHelperText error>{errors.duration}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="noofpersons"
                    as={TextField}
                    label="Number of Persons"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={touched.noofpersons && !!errors.noofpersons}
                    value={values.noofpersons}
                    onChange={(e) => {
                      const noofpersons = parseFloat(e.target.value) || 0;
                      setFieldValue('noofpersons', noofpersons);
                      const totalamount = noofpersons * parseInt(values.amount) * parseInt(values.duration);
                      setFieldValue('totalamount', totalamount);
                    }}
                    InputProps={{
                      inputProps: { min: 1, max: 10 },
                    }}
                  />
                  {touched.noofpersons && errors.noofpersons && (
                    <FormHelperText error>{errors.noofpersons}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="totalamount"
                    as={TextField}
                    label="Total Amount"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={touched.totalamount && !!errors.totalamount}
                    disabled="true"
                  />
                  {touched.totalamount && errors.totalamount && (
                    <FormHelperText error>{errors.totalamount}</FormHelperText>
                  )}
                </div>
              </div>              
              <div className='row'>
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
              </div>
              <div className='row'>
              </div>
              <Box className='row save-btn'>
                <Button variant="contained" type="submit" color='primary'>Save Changes</Button>
              </Box>              
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default GuestScreen;