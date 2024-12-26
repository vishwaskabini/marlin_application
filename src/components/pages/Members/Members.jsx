import React, { useEffect, useState } from 'react';
import ListTable from '../../common/components/ListTable';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, Input, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';
import LoadingIndicator from '../../common/components/LoadingIndicator';

const Members = () => {
  const [membersExpiringToday, setMembersExpiringToday] = useState([]);
  const [membersExpiringIn5Days, setMembersExpiringIn5Days] = useState([]);
  const [membersExpired, setMembersExpired] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [rowsData, setRowsData] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState();
  const [initialValuesPackages, setInitialValuesPackages] = useState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpenPackage, setIsDialogOpenPackage] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditPackage, setIsEditPackage] = useState(false);  
  const userTypeId = 'a4e1f874-9c36-41aa-8af4-f94615c6c363';  

  const handleEdit = (id) => {
    setIsEdit(true);
    var data = members.find(item => item.id == id);
    setInitialValues({
      userType: userTypeId,
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      gender: data.gender,
      schoolorcompanyname: data.schoolorcompanyname,
      district: data.district,
      area: data.area,
      state: 'Karnataka',
      pincode: data.pincode,
      coachingmembership: data.coachingmembership,
      primarycontactnumber: data.primarycontactnumber,
      address1: data.address1,
      aadharUpload: null,
      photoUpload: null
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setIsLoading(true);
    apiClient.delete("/api/Users/"+id).then(() =>{      
      getData();
      toast.success("Member Deleted Successfully !", {
        position: "top-right"
      });
    }).catch((error) =>{
      setIsLoading(false);
      toast.error("Error while delete " + error, {
        position: "top-right"
      });
    });
  };

  const getData = () => {
    setIsLoading(true);
    apiClient.get("/api/Users/GetAllWithDetails").then((data) => {
      var members = data.filter((user) => user.usertype == userTypeId);
      setMembers(members);
      let membersData = members.map((item) => {
        return {
          id: item.id,
          name: item.firstname + " " + item.lastname,
          contact: item.primarycontactnumber,
          paymentStatus: item.payment?.paymentstatus,
          payment: item.payment?.amount,
          package: item.package?.name,
          packageenddate: item.payment?.packageenddate
        }
      });
      setMembersExpiringToday(membersData.filter((user) => {
        const endDate = new Date(user.packageenddate);
        const today = new Date();
        
        return endDate.getDate() === today.getDate() && 
              endDate.getMonth() === today.getMonth() && 
              endDate.getFullYear() === today.getFullYear();
      }));
      setMembersExpiringIn5Days(membersData.filter((user) => {
        const endDate = new Date(user.packageenddate);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(today.getDate() + 5);

        return endDate >= today && endDate <= fiveDaysFromNow;
      }));
      setMembersExpired(membersData.filter((item) => {
        const packageEndDate = new Date(item.packageenddate);
        const currentDate = new Date();
        return packageEndDate <= currentDate;
      }));
      setActiveMembers(membersData.filter((item) => {
        const packageEndDate = new Date(item.packageenddate);
        const currentDate = new Date();
        return packageEndDate >= currentDate;
      }));
      setAllMembers(membersData);
      setRowsData(membersData);
      setIsLoading(false);      
    }).catch((error) => {      
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    getData();    
  }, []);

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'contact', label: 'Contact' },
    { id: 'paymentStatus', label: 'Payment Status' },
    { id: 'payment', label: 'Payment' },
    { id: 'package', label: 'Package' },
  ];

  const onDialogClose = () => {
    setIsDialogOpen(false);
  }

  const onDialogClosePackage = () => {
    setIsDialogOpenPackage(false);
  }

  const handleFormSubmit = (values) => {
    setIsLoading(true);
    if (isEdit) {
      apiClient.put("/api/Users/update", values).then((data) => {
        saveDocuments(values, values.id);
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while updated " + error, {
          position: "top-right"
        });
      });
    } else {
      apiClient.post("/api/Users/create", values).then((data) => {
        saveDocuments(values, data);
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while Create " + error, {
          position: "top-right"
        });
      });
    }
  }

  const handleFormSubmitPackage = (values) => {
    console.log(values);
    setIsLoading(true);
    apiClient.post("/api/UsersPaymentMappingService/create", values).then((data) =>  {
      updateSlot(values);
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while create payment" + error, {
        position: "top-right"
      });
    });
  }

  const updateSlot = (values) => {
    var data = {
      userid: values.userid,
      timeslotid: values.slots
    }
    apiClient.post("/api/UsersScheduleMapping/create", data).then((result) =>  {
      getData();
      setIsDialogOpenPackage(false);
      toast.success("Package Updated Successfully !", {
        position: "top-right"
      });
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while create payment" + error, {
        position: "top-right"
      });
    });
  }

  const handlePackages = (id) => {
    var data = members.find(item => item.id == id);
    if(data.package && data.payment) {      
      setInitialValuesPackages({
        userid: data.id,
        packageId: data.package.id,
        packageStartDate: data.payment.packagestartdate,
        packageActualStartDate: data.payment.actualstartdate,
        packageEndDate: data.payment.packageenddate,
        amount: data.payment.amount,
        discount: '',
        roundedAmount: data.payment.roundedpayment,
        paymentType: data.payment.paymenttype,
        paymentStatus: data.payment.paymentStatus,
        balanceAmount: '',
        transactionid: data.payment.transactionId,
        slots: (data.schedule && data.schedule.length > 0 ? data.schedule[0].timeslotid : '')
      });
    } else {
      setInitialValuesPackages({
        userid: data.id,
        packageId: '',
        packageStartDate: '',
        packageActualStartDate: '',
        packageEndDate: '',
        amount: '',
        discount: '',
        roundedAmount: '',
        paymentType: '',
        paymentStatus: '',
        balanceAmount: '',
        transactionid: '',
        slots: ''
      });
    }
    setIsDialogOpenPackage(true);
  }

  const saveDocuments = (values, data) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
    const formData = new FormData();
    formData.append("userPhoto", values.photoUpload);
    formData.append("suppprtdocument", values.aadharUpload);
    apiClient.put("/api/Users/Upload?userId="+data, formData, config).then((data) => {
      getData();
      setIsDialogOpen(false);
      if(isEdit) {
        toast.success("Member Updated Successfully !", {
          position: "top-right"
        });
      } else {
        toast.success("Member Created Successfully !", {
          position: "top-right"
        });
      }      
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while Create upload " + error, {
        position: "top-right"
      });
    });    
  }

  const handleAddMemberDiaglog = () => {
    setIsEdit(false);
    setInitialValues({
      userType: userTypeId,
      firstname: '',
      lastname: '',
      gender: '',
      schoolorcompanyname: '',
      district: '',
      area: '',
      state: 'Karnataka',
      pincode: '',
      coachingmembership: '',
      primarycontactnumber: '',
      address1: '',
      aadharUpload: null,
      photoUpload: null
    });
    setIsDialogOpen(true);
  }

  const handleSummary = (rowData) => {
    console.log(rowData);
    setRowsData(rowData);
  }

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Typography variant='h5' className='header-text'>Members
            <Button variant="contained" sx={{marginLeft: "auto"}} startIcon={<AddIcon />} onClick={handleAddMemberDiaglog}>Add Member</Button>
          </Typography>          
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(allMembers)}>
            <CardContent className='members-summary-div'>
              <img src='/img/team.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary">All</Typography>
                <Typography variant="h5">{allMembers.length}</Typography>
              </Box>              
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(activeMembers)}>
            <CardContent className='members-summary-div'>
              <img src='/img/active.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary">Active</Typography>
                <Typography variant="h5">{activeMembers.length}</Typography>
              </Box>              
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(membersExpired)}>
            <CardContent className='members-summary-div'>
              <img src='/img/expired.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary">Expired</Typography>
                <Typography variant="h5">{membersExpired.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(membersExpiringToday)}>
            <CardContent className='members-summary-div member-summary-fullwidth'>
              <img src='/img/subscribe.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary">Expiring Today</Typography>
                <Typography variant="h5">{membersExpiringToday.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(membersExpiringIn5Days)}>
            <CardContent className='members-summary-div member-summary-fullwidth'>
              <img src='/img/subscription-model.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary">Expiring in 5 Days</Typography>
                <Typography variant="h5">{membersExpiringIn5Days.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <ListTable columns={columns} rows={rowsData} onEdit={handleEdit} onDelete={handleDelete} onPackage={handlePackages} tableName="Full Members List"/>
          </CardContent>
        </Card>
      </Box>
      <MemberDialog open={isDialogOpen} handleClose={onDialogClose} isEdit={isEdit}
        initialValues={initialValues}
        handleFormSubmit={handleFormSubmit}/>
      <PackageDialog open={isDialogOpenPackage} handleClose={onDialogClosePackage} isEdit={isEditPackage}
        initialValues={initialValuesPackages}
        handleFormSubmit={handleFormSubmitPackage}/>
      <LoadingIndicator isLoading={isLoading}/>
    </div>
  );
};


const MemberDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit}) => {

  const validationSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    gender: Yup.string().required('Gender is required'),
    schoolorcompanyname: Yup.string().required('School/Company Name is required'),
    district: Yup.string().required('City is required'),
    area: Yup.string().required('Area is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string().required('Pincode is required').matches(/^[0-9]{6}$/, 'Invalid pincode'),
    coachingmembership: Yup.string().required('Coaching or Membership is required'),
    primarycontactnumber: Yup.string().required('Contact is required').matches(/^[0-9]{10}$/, 'Invalid contact number'),
    address1: Yup.string().required('Address is required'),
    aadharUpload: Yup.mixed().required('Aadhar upload is required'),
    photoUpload: Yup.mixed().required('Photo upload is required')
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <Formik initialValues={initialValues} validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({errors, touched, setFieldValue}) => (
            <Form>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="firstname"
                    as={TextField}
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    error={touched.firstname && Boolean(errors.firstname)}
                    helperText={touched.firstname && errors.firstname}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="lastname"
                    label="Last Name"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.lastname && Boolean(errors.lastname)}
                    helperText={touched.lastname && errors.lastname}
                  />
                </div>
                <div className='form-group'>
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
                <div className='form-group'>
                  <Field
                    name="address1"
                    label="Address"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.address1 && Boolean(errors.address1)}
                    helperText={touched.address1 && errors.address1}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="district"
                    label="City"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.district && Boolean(errors.district)}
                    helperText={touched.district && errors.district}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="area"
                    label="Area"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.area && Boolean(errors.area)}
                    helperText={touched.area && errors.area}
                  />
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="state"
                    label="State"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.state && Boolean(errors.state)}
                    helperText={touched.state && errors.state}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="pincode"
                    label="Pincode"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.pincode && Boolean(errors.pincode)}
                    helperText={touched.pincode && errors.pincode}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="primarycontactnumber"
                    label="Contact"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.primarycontactnumber && Boolean(errors.primarycontactnumber)}
                    helperText={touched.primarycontactnumber && errors.primarycontactnumber}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start">+91</InputAdornment>)
                    }}
                  />
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="schoolorcompanyname"
                    label="School/Company"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.schoolorcompanyname && Boolean(errors.schoolorcompanyname)}
                    helperText={touched.schoolorcompanyname && errors.schoolorcompanyname}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="coachingmembership"
                    label="Coaching Membership"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.coachingmembership && Boolean(errors.coachingmembership)}
                    helperText={touched.coachingmembership && errors.coachingmembership}
                  />
                </div>
                <div className='form-group'>
                  <FormControl fullWidth>
                    <Typography variant="body2">Photo Upload</Typography>
                    <Input
                      type="file"
                      name="photoUpload"
                      onChange={(event) => setFieldValue('photoUpload', event.currentTarget.files[0])}
                      fullWidth
                      inputProps={{
                        style: { border: '1px solid #ccc', padding: '6px 10px' }
                      }}
                    />
                    <FormHelperText>
                      <ErrorMessage name="photoUpload" />
                    </FormHelperText>
                  </FormControl>
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <FormControl fullWidth>
                    <Typography variant="body2">Aadhar Upload</Typography>
                    <Input
                      type="file"
                      name="aadharUpload"
                      onChange={(event) => setFieldValue('aadharUpload', event.currentTarget.files[0])}
                      fullWidth
                      inputProps={{
                        style: { border: '1px solid #ccc', padding: '6px 10px' }
                      }}
                    />
                    <FormHelperText>
                      <ErrorMessage name="aadharUpload" />
                    </FormHelperText>
                  </FormControl>
                </div>
              </div>
              <div className='row save-btn'>
                <Button type="submit" color="primary" variant="contained">
                  {isEdit ? 'Save Changes' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}


const PackageDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit}) => {

  const paymentTypeOnline = '22220087-c3c2-4268-a25a-13baa6f3625f';
  const paymentTypeCash = '22220087-c3c2-4268-a25a-13baa6f3625e';
  const [packageTypes, setPackageTypes] = useState([]);
  const [slots, setSlots] = useState([]);

  const getPackages = () => {
    apiClient.get("/api/Packages").then((data) => {
      setPackageTypes(data);
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  const getSlotDetails = () => {
    apiClient.get("/api/Timeslots").then((data) => {
      setSlots(data);
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    getPackages();
    getSlotDetails();
  }, [])

  const validationSchema = Yup.object().shape({
    packageId: Yup.string().required('Package type is required'),
    packageStartDate: Yup.date().required('Package start date is required'),
    packageActualStartDate: Yup.date().required('Package actual start date is required'),
    packageEndDate: Yup.date().required('Package end date is required'),
    amount: Yup.number().required('Amount is required').min(1, 'Amount must be greater than 0'),
    discount: Yup.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%'),
    paymentType: Yup.string().required('Payment type is required'),
    paymentStatus: Yup.string().required('Payment status is required'),
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
    roundedAmount: Yup.number().min(0, 'Rounded amount must be positive'),
    balanceAmount: Yup.number()
      .when('paymentStatus', {
        is: 'Partial',
        then: (schema) => schema.required('Balance amount is required').min(0, 'Balance must be positive'),
        otherwise: (schema) => schema.notRequired(),
      }),
    slots: Yup.string().required("slots is required")
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{isEdit ? 'Edit Packages' : 'Add Packages'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
      <Formik initialValues={initialValues} validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({errors, touched, handleChange, values, isSubmitting}) => (
            <Form>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="packageId"
                    as={TextField}
                    label="Package Type"
                    select
                    fullWidth
                    value={values.packageId}
                    onChange={handleChange}
                    error={touched.packageId && Boolean(errors.packageId)}
                    helperText={touched.packageId && errors.packageId}
                  >
                    {packageTypes.map((packageType) => (
                      <MenuItem key={packageType.id} value={packageType.id}>{packageType.name + " " + packageType.duration}</MenuItem>
                    ))}
                  </Field>
                </div>
                <div className='form-group'>
                  <Field
                    name="packageStartDate"
                    as={TextField}
                    label="Package Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={values.packageStartDate}
                    onChange={handleChange}
                    error={touched.packageStartDate && Boolean(errors.packageStartDate)}
                    helperText={touched.packageStartDate && errors.packageStartDate}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="packageActualStartDate"
                    as={TextField}
                    label="Package Actual Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={values.packageActualStartDate}
                    onChange={handleChange}
                    error={touched.packageActualStartDate && Boolean(errors.packageActualStartDate)}
                    helperText={touched.packageActualStartDate && errors.packageActualStartDate}
                  />
                </div>
              </div>
              <div className='row'>                
                <div className='form-group'>
                  <Field
                    name="packageEndDate"
                    as={TextField}
                    label="Package End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={values.packageEndDate}
                    onChange={handleChange}
                    error={touched.packageEndDate && Boolean(errors.packageEndDate)}
                    helperText={touched.packageEndDate && errors.packageEndDate}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="amount"
                    as={TextField}
                    label="Amount"
                    type="number"
                    fullWidth
                    value={values.amount}
                    onChange={handleChange}
                    error={touched.amount && Boolean(errors.amount)}
                    helperText={touched.amount && errors.amount}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="discount"
                    as={TextField}
                    label="Discount"
                    type="number"
                    fullWidth
                    value={values.discount}
                    onChange={handleChange}
                    error={touched.discount && Boolean(errors.discount)}
                    helperText={touched.discount && errors.discount}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                    }}
                  />
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="paymentType"
                    as={TextField}
                    label="Payment Type"
                    select
                    fullWidth
                    value={values.paymentType}
                    onChange={handleChange}
                    error={touched.paymentType && Boolean(errors.paymentType)}
                    helperText={touched.paymentType && errors.paymentType}
                  >
                    <MenuItem value="">
                      <em>Select Payment</em>
                    </MenuItem>
                    <MenuItem value={paymentTypeCash}>Cash</MenuItem>
                    <MenuItem value={paymentTypeOnline}>UPI</MenuItem>
                  </Field>
                </div>
                <div className='form-group'>
                  <Field
                    name="paymentStatus"
                    as={TextField}
                    label="Payment Status"
                    select
                    fullWidth
                    value={values.paymentStatus}
                    onChange={handleChange}
                    error={touched.paymentStatus && Boolean(errors.paymentStatus)}
                    helperText={touched.paymentStatus && errors.paymentStatus}
                  >
                    <MenuItem value="">
                      <em>Select Payment Status</em>
                    </MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Field>
                </div>
                <div className='form-group'>
                  <Field
                    name="roundedAmount"
                    as={TextField}
                    label="Rounded Amount"
                    type="number"
                    fullWidth
                    value={values.roundedAmount}
                    onChange={handleChange}
                    error={touched.roundedAmount && Boolean(errors.roundedAmount)}
                    helperText={touched.roundedAmount && errors.roundedAmount}
                  />
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="slots"
                    as={TextField}
                    label="Time Slots"
                    select
                    fullWidth
                    value={values.slots}
                    onChange={handleChange}
                    error={touched.slots && Boolean(errors.slots)}
                    helperText={touched.slots && errors.slots}
                  >
                    {slots.map((slot) => (
                      <MenuItem key={slot.id} value={slot.id}>{slot.name} - {slot.time}</MenuItem>
                    ))}
                  </Field>
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
                {values.paymentStatus === 'Partial' && (
                  <div className='form-group'>
                    <Field
                      name="balanceAmount"
                      as={TextField}
                      label="Balance Amount"
                      type="number"
                      fullWidth
                      value={values.balanceAmount}
                      onChange={handleChange}
                      error={touched.balanceAmount && Boolean(errors.balanceAmount)}
                      helperText={touched.balanceAmount && errors.balanceAmount}
                    />
                  </div>
                )}
              </div>
              <div className='row save-btn'>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
      </Formik>        
      </DialogContent>
    </Dialog>
  );
}

export default Members;