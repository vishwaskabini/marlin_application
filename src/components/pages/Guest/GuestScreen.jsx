import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { Box, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import AddIcon from '@mui/icons-material/Add';
import ListTableCustom from '../../common/components/DataGrid';
import dayjs from 'dayjs';

const emptyValues = {
  id: '',
  firstname: '',
  lastname: '',
  contactnumber: '',
  gender: '',
  amount: 0,
  amountcash: 0,
  amountupi: 0,
  amountupicompany: 0,
  duration: 1,
  totalamount: 0,
  paymenttype: '07fcccea-c2ed-4a4a-a7db-1a950913496d',
  transactionid: '',
  noofpersons: 1,
  registereddate: dayjs()
};

const GuestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [dialogInitialValues, setDialogInitialValues] = useState(emptyValues);
  const [guestData, setGuestData] = useState([]);

  const getGuestData = () => {
    setIsLoading(true);
    apiClient.get("/api/Guests/GetDataBy2Days").then((data) => {
      setIsLoading(false);
      const formattedData = data.map((item) => ({
        ...item,
        registereddate: dayjs(item.registereddate).format("DD/MM/YYYY HH:mm:ss")
      }));
      setGuestData(formattedData);
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while fetching guest data: " + error, { position: "top-right" });
    });
  };

  useEffect(() => {
    getGuestData();
  }, []);

  const onDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleAddGuest = () => {
    setIsEdit(false);
    setDialogInitialValues({ ...emptyValues, registereddate: dayjs() });
    setIsDialogOpen(true);
  };

  const handleEditGuest = (id) => {
    const guest = guestData.find((item) => item.id === id);
    if (!guest) return;
    setIsEdit(true);

    const noofpersons = guest.noofpersons || 1;
    const duration = guest.duration || 1;
    const totalamount = guest.totalamount || 0;
    const amount = guest.amount || (noofpersons > 0 && duration > 0 ? totalamount / (noofpersons * duration) : 0);

    setDialogInitialValues({
      id: guest.id,
      firstname: guest.firstname || '',
      lastname: guest.lastname || '',
      contactnumber: guest.contactnumber || '',
      gender: guest.gender || '',
      amount,
      amountcash: guest.amountcash || 0,
      amountupi: guest.amountupi || 0,
      amountupicompany: guest.amountupicompany || 0,
      duration,
      totalamount,
      paymenttype: guest.paymenttype || '07fcccea-c2ed-4a4a-a7db-1a950913496d',
      transactionid: guest.transactionid || '',
      noofpersons,
      registereddate: guest.registereddate
        ? dayjs(guest.registereddate, "DD/MM/YYYY HH:mm:ss")
        : dayjs()
    });
    setIsDialogOpen(true);
  };

  const buildPayload = (values) => ({
    ...values,
    upicompany: values.amountupicompany,
    registereddate: values.registereddate
      ? (dayjs.isDayjs(values.registereddate) ? values.registereddate.toISOString() : dayjs(values.registereddate).toISOString())
      : dayjs().toISOString()
  });

  const handleSubmit = (values) => {
    setIsLoading(true);
    const payload = buildPayload(values);
    if (isEdit) {
      apiClient.put("/api/Guests/update", payload).then(() => {
        setIsDialogOpen(false);
        getGuestData();
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while updating guest: " + error, { position: "top-right" });
      });
    } else {
      apiClient.post("/api/Guests/create", payload).then(() => {
        setIsDialogOpen(false);
        getGuestData();
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while creating guest: " + error, { position: "top-right" });
      });
    }
  };

  const columns = [
    { id: 'firstname', label: 'First Name' },
    { id: 'lastname', label: 'Last Name' },
    { id: 'contactnumber', label: 'Contact' },
    { id: 'gender', label: 'Gender' },
    { id: 'totalamount', label: 'Total Amount' },
    { id: 'registereddate', label: 'Register Datetime' },
  ];

  const menuActions = [
    { label: 'Edit', onClick: handleEditGuest },
  ];

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
          <Typography variant='h5' className='header-text'>Guest Registration
            <Button variant="contained" sx={{ marginLeft: "auto" }} startIcon={<AddIcon />} onClick={handleAddGuest}>Add Guest</Button>
          </Typography>
        </Box>
        <Card sx={{ marginBottom: "10px" }}>
          <CardContent>
            <ListTableCustom columns={columns} rows={guestData} tableName="Guest List" menuActions={menuActions} />
          </CardContent>
        </Card>
      </Box>
      <LoadingIndicator isLoading={isLoading} />
      <GuestDialog
        open={isDialogOpen}
        handleClose={onDialogClose}
        initialValues={dialogInitialValues}
        handleFormSubmit={handleSubmit}
        isEdit={isEdit}
      />
    </div>
  );
};


const GuestDialog = ({ open, handleClose, initialValues, handleFormSubmit, isEdit }) => {
  const validationSchema = Yup.object({
    firstname: Yup.string().required('First Name is required'),
    lastname: Yup.string(),
    contactnumber: Yup.string(),
    gender: Yup.string(),
    amount: Yup.number().positive('Amount must be positive'),
    amountcash: Yup.number().min(0),
    amountupi: Yup.number().min(0),
    amountupicompany: Yup.number().min(0),
    totalamount: Yup.number()
      .positive('Total Amount must be positive')
      .test(
        'payment-sum',
        'Amount Cash + Amount Online + Amount UPI Company must equal Total Amount',
        function (totalamount) {
          const { amountcash, amountupi, amountupicompany } = this.parent;
          const sum = (parseFloat(amountcash) || 0) + (parseFloat(amountupi) || 0) + (parseFloat(amountupicompany) || 0);
          return Math.abs(sum - (parseFloat(totalamount) || 0)) < 0.01;
        }
      ),
    duration: Yup.number().positive('Duration must be positive'),
    paymenttype: Yup.string(),
    transactionid: Yup.string(),
    noofpersons: Yup.number().positive('Must be positive'),
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { minWidth: "80%" } }}>
      <DialogTitle>{isEdit ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
      <DialogContent sx={{ padding: "2rem !important" }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ touched, errors, values, setFieldValue, handleChange }) => (
            <Form>
              <div className='row'>
                <div className="form-group">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Registration Date"
                      value={values.registereddate ? dayjs(values.registereddate) : null}
                      onChange={(date) => setFieldValue('registereddate', date)}
                      sx={{ width: "100%" }}
                    />
                  </LocalizationProvider>
                </div>
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
                      <MenuItem value=""><em>Select Gender</em></MenuItem>
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
                      const val = e.target.value;
                      if (val === "") { setFieldValue('amount', ""); return; }
                      const amount = parseFloat(val);
                      setFieldValue('amount', amount);
                      const totalamount = amount * (parseInt(values.duration) || 1) * (parseInt(values.noofpersons) || 1);
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
                      const val = e.target.value;
                      if (val === "") { setFieldValue('duration', ""); return; }
                      const duration = parseFloat(val);
                      setFieldValue('duration', duration);
                      const totalamount = duration * parseFloat(values.amount) * parseFloat(values.noofpersons);
                      setFieldValue('totalamount', totalamount);
                    }}
                    InputProps={{ inputProps: { min: 1, max: 8 } }}
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
                      const val = e.target.value;
                      if (val === "") { setFieldValue('noofpersons', ""); return; }
                      const noofpersons = parseFloat(val);
                      setFieldValue('noofpersons', noofpersons);
                      const totalamount = noofpersons * parseFloat(values.amount) * parseFloat(values.duration);
                      setFieldValue('totalamount', totalamount);
                    }}
                    InputProps={{ inputProps: { min: 1, max: 1000 } }}
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
                    disabled
                    error={touched.totalamount && !!errors.totalamount}
                  />
                  {touched.totalamount && errors.totalamount && (
                    <FormHelperText error>{errors.totalamount}</FormHelperText>
                  )}
                </div>
              </div>

              <div className='row'>
                <div className="form-group">
                  <Field
                    name="amountcash"
                    as={TextField}
                    label="Amount Cash"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={touched.amountcash && !!errors.amountcash}
                    value={values.amountcash}
                    onChange={handleChange}
                  />
                  {touched.amountcash && errors.amountcash && (
                    <FormHelperText error>{errors.amountcash}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="amountupi"
                    as={TextField}
                    label="Amount Online"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={touched.amountupi && !!errors.amountupi}
                    value={values.amountupi}
                    onChange={handleChange}
                  />
                  {touched.amountupi && errors.amountupi && (
                    <FormHelperText error>{errors.amountupi}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="amountupicompany"
                    as={TextField}
                    label="Amount UPI - Company"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={touched.amountupicompany && !!errors.amountupicompany}
                    value={values.amountupicompany}
                    onChange={handleChange}
                  />
                  {touched.amountupicompany && errors.amountupicompany && (
                    <FormHelperText error>{errors.amountupicompany}</FormHelperText>
                  )}
                </div>
                <div className="form-group">
                  <Field
                    name="transactionid"
                    as={TextField}
                    label="Transaction ID"
                    variant="outlined"
                    fullWidth
                    error={touched.transactionid && !!errors.transactionid}
                  />
                  {touched.transactionid && errors.transactionid && (
                    <FormHelperText error>{errors.transactionid}</FormHelperText>
                  )}
                </div>
              </div>

              <Box className='row save-btn'>
                <Button variant="contained" type="submit" color='primary'>Save Changes</Button>
              </Box>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default GuestScreen;
