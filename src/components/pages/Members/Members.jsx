import React, { useEffect, useState } from 'react';
import ListTable from '../../common/components/ListTable';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Input, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, Checkbox } from '@mui/material';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

const convertToDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
};

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
  const [initialValuesPayments, setInitialValuesPayments] = useState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpenPackage, setIsDialogOpenPackage] = useState(false);
  const [isDialogOpenPayment, setIsDialogOpenPayment] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditPackage, setIsEditPackage] = useState(false);  
  const userTypeId = 'a4e1f874-9c36-41aa-8af4-f94615c6c363';
  const [packageTypes, setPackageTypes] = useState([]); 

  const handleEdit = (id) => {
    setIsEdit(true);
    var data = members.find(item => item.id == id);
    setInitialValues({
      userType: userTypeId,
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      gender: data.gender,
      schoolorcompanyname: data.schoolorcompanyname,
      district: data.district,
      area: data.area,
      state: 'Karnataka',
      pincode: data.pincode,
      coachingmembership: data.coachingmembership,
      primarycontactnumber: data.primarycontactnumber,
      address1: data.address1,
      aadharUpload: data.idproof,
      photoUpload: data.photo,
      idproofname: data.idproofname,
      photoname: data.photoname,
      secondarycontactnumber: data.secondarycontactnumber,
      isspecialchild: data.isspecialchild,
      referredby: data.referredby
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
    apiClient.get("/api/Users/GetAllWithDetailsActive").then((data) => {
      var members = data.filter((user) => user.usertype == userTypeId);
      setMembers(members);
      let membersData = members.map((item) => {
        return {
          id: item.id,
          name: item.firstname + " " + item.lastname,
          contact: item.primarycontactnumber,
          paymentstatus: item.packagepaymentDetails && item.packagepaymentDetails.length > 0 ? item.packagepaymentDetails[0].paymentstatus : "Pending",
          payment: item.packagepaymentDetails && item.packagepaymentDetails.length > 0 ? item.packagepaymentDetails[0].amount : "",
          package: item.packageDetails && item.packageDetails.length > 0 ? getPackageName(item.packageDetails[0].packageid) : "",
          packageenddate: item.packageDetails && item.packageDetails.length > 0 ? formatDate(item.packageDetails[0].actualenddate) : "",
          paymentstatusAction: item.packagepaymentDetails && item.packagepaymentDetails.length > 0 && item.packagepaymentDetails[0].paymentstatus === "Paid" ? true : false
        }
      });
      setMembersExpiringToday(membersData.filter((user) => {
        const endDate = convertToDate(user.packageenddate);
        const today = new Date();
        
        return endDate.getDate() === today.getDate() && 
              endDate.getMonth() === today.getMonth() && 
              endDate.getFullYear() === today.getFullYear();
      }));
      setMembersExpiringIn5Days(membersData.filter((user) => {
        const endDate = convertToDate(user.packageenddate);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(today.getDate() + 5);

        return endDate >= today && endDate <= fiveDaysFromNow;
      }));
      setMembersExpired(membersData.filter((item) => {
        const packageenddate = convertToDate(item.packageenddate);
        const currentDate = new Date();
        return packageenddate <= currentDate;
      }));
      setActiveMembers(membersData.filter((item) => {
        const packageenddate = convertToDate(item.packageenddate);
        const currentDate = new Date();
        return packageenddate >= currentDate;
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

  const getPackages = () => {
    setIsLoading(true);
    apiClient.get("/api/Packages").then((data) => {
      setIsLoading(false);
      setPackageTypes(data);
      if(data && data.length > 0 && initialValuesPackages && !data.package && !data.payment) {
        initialValuesPackages.amount = data[0].cost;
        initialValuesPackages.payableamount = data[0].cost;
        initialValuesPackages.roundedpayment = data[0].cost;
      }
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    if (packageTypes.length > 0) {
      getData();
    }
  }, [packageTypes]);

  useEffect(() => {
    getPackages();    
  }, []);

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'contact', label: 'Contact' },
    { id: 'paymentstatus', label: 'Payment Status' },
    { id: 'payment', label: 'Payment' },
    { id: 'package', label: 'Package' },
    { id: 'packageenddate', label: 'Package End Date' },
  ];

  const onDialogClose = () => {
    setIsDialogOpen(false);
  }

  const onDialogClosePackage = () => {
    setIsDialogOpenPackage(false);
  }

  const onDialogClosePayment = () => {
    setIsDialogOpenPayment(false);
  }

  const handleFormSubmit = (values) => {
    setIsLoading(true);
    if (isEdit) {
      apiClient.put("/api/Users/update", values).then((data) => {
        if(values.photoUpload || values.aadharUpload) {
          saveDocuments(values, values.id);
        } else {
          getData();
          setIsDialogOpen(false);
          toast.success("Member Updated Successfully !", {
            position: "top-right"
          });
        }
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while updated " + error, {
          position: "top-right"
        });
      });
    } else {
      apiClient.post("/api/Users/create", values).then((data) => {
        if(values.photoUpload || values.aadharUpload) {          
          saveDocuments(values, data);
        } else {
          getData();
          setIsDialogOpen(false);
          toast.success("Member Created Successfully !", {
            position: "top-right"
          });
        }
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while Create " + error, {
          position: "top-right"
        });
      });
    }
  }

  const handleFormSubmitPackage = (values) => {
    values.packagestartdate = convertToDate(values.packagestartdate).toISOString();
    values.actualstartdate = convertToDate(values.actualstartdate).toISOString();
    values.packageenddate = convertToDate(values.packageenddate).toISOString();
    values.actualenddate = convertToDate(values.actualenddate).toISOString();
    const packegeObj = {
      userid: values.userid,
      packageid: values.packageid,
      packagestartdate: values.packagestartdate,
      packageenddate: values.packageenddate,
      actualstartdate: values.actualstartdate,
      actualenddate: values.actualenddate,
      id: values.id
    }
    setIsLoading(true);
    if (isEditPackage) {
      apiClient.put("/api/UsersPackageMapping/update", packegeObj).then((data) =>  {        
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
    else {
      apiClient.post("/api/UsersPackageMapping/create", packegeObj).then((data) =>  {        
        if(values.paymentstatus !== "Pending") {
          values.userpackagemappingid = data;
          addPayment(values, false);
        }
        updateSlot(values);
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while create payment" + error, {
          position: "top-right"
        });
      });
    }
  }

  const handleFormSubmitPayment = (values) => {
    addPayment(values, true);
  }

  const updateSlot = (values) => {
    var data = {
      userid: values.userid,
      timeslotid: values.slots,
      startDate: values.actualstartdate,
      endDate: values.actualenddate
    }
    apiClient.post("/api/UsersScheduleMapping/createDateRange", data).then((result) =>  {
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

  const addPayment = (values, shouldShowMsg) => {
    const payment = {
      userpackagemappingid: values.userpackagemappingid,
      paymenttype: values.paymenttype,
      amount: values.amount,
      transactionid: values.transactionid,
      employeeid: "",
      notes: values.notes,
      extendby: 0,
      roundedpayment: values.roundedpayment,
      paymentstatus: values.paymentstatus,
      pendingamount: values.pendingamount,
      payableamount: values.payableamount,
      discount: values.discount,
    }
    apiClient.post("/api/UsersPaymentMapping/create", payment).then((result) =>  {
      getData();
      setIsDialogOpenPackage(false);
      setIsDialogOpenPayment(false);
      if(shouldShowMsg) {
        toast.success("Payment Added Successfully !", {
          position: "top-right"
        });
      }      
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while create payment" + error, {
        position: "top-right"
      });
    });
  }

  const handlePackages = (id) => {
    var data = members.find(item => item.id == id);
    if(data.packageDetails && data.packageDetails.length > 0) {
      setIsEditPackage(true);
      const packageDetails = data.packageDetails[0];
      setInitialValuesPackages({
        id: packageDetails.id,
        userid: data.id,
        packageid: packageDetails.packageid,
        packagestartdate: packageDetails.packagestartdate ? formatDate(packageDetails.packagestartdate) : null,
        actualstartdate: packageDetails.actualstartdate ? formatDate(packageDetails.actualstartdate) : null,
        packageenddate: packageDetails.packageenddate ? formatDate(packageDetails.packageenddate) : null,
        actualenddate: packageDetails.actualenddate ? formatDate(packageDetails.actualenddate) : null,
        amount: 0,
        discount: 0,
        roundedpayment: 0,
        payableamount: 0,
        paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
        paymentstatus: 'Pending',
        pendingamount: 0,
        transactionid: '',
        notes: '',
        slots: (data.schedule && data.schedule.length > 0 ? data.schedule[0].timeslotid : '')
      });
    } else {
      setIsEditPackage(false);
      setInitialValuesPackages({
        id: '',
        userid: data.id,
        packageid: '',
        packagestartdate: dayjs().format('DD/MM/YYYY'),
        actualstartdate: dayjs().format('DD/MM/YYYY'),
        packageenddate: '',
        actualenddate: '',
        amount: 0,
        discount: 0,
        payableamount: 0,
        roundedpayment: 0,
        paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
        paymentstatus: 'Pending',
        pendingamount: 0,
        transactionid: '',
        notes: '',
        slots: ''
      });
    }
    setIsDialogOpenPackage(true);
  }

  const sortedData = (data) => {
    return data.sort((a, b) => {
      return new Date(b.updateddate) - new Date(a.updateddate);
    });
  };

  const handlePayments = (id) => {
    var data = members.find(item => item.id == id);
    if(data.packageDetails && data.packageDetails.length > 0) {
      const packageDetails = getPackageDetails(data.packageDetails[0].packageid);
      if(data.packagepaymentDetails && data.packagepaymentDetails.length > 0) {
        let paymentDetails = sortedData(data.packagepaymentDetails);
        setInitialValuesPayments({
          userpackagemappingid: paymentDetails[0].id,
          amount: paymentDetails[0].amount,
          discount: paymentDetails[0].discount,
          payableamount: paymentDetails[0].payableamount,
          roundedpayment: paymentDetails[0].pendingamount,
          paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
          paymentstatus: 'Partial',
          pendingamount: 0,
          transactionid: '',
          notes: paymentDetails[0].notes,
        });
      } else {
        setInitialValuesPayments({
          userpackagemappingid: data.packageDetails[0].id,
          amount: packageDetails.cost,
          discount: 0,
          payableamount: packageDetails.cost,
          roundedpayment: packageDetails.cost,
          paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
          paymentstatus: 'Pending',
          pendingamount: 0,
          transactionid: '',
          notes: '',
        });
      }      
      setIsDialogOpenPayment(true);
    } else {
      toast.error("No valid packages available, Please add package before making payment", {
        position: "top-right"
      });
    }    
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
      email: '',
      gender: '',
      schoolorcompanyname: '',
      district: '',
      area: '',
      state: 'Karnataka',
      pincode: '',
      coachingmembership: '',
      primarycontactnumber: '',
      secondarycontactnumber: '',
      referredby: '',
      isspecialchild: false,
      address1: '',
      aadharUpload: null,
      photoUpload: null,
      idproofname: '',
      photoname: ''
    });
    setIsDialogOpen(true);
  }

  const handleSummary = (rowData) => {
    console.log(rowData);
    setRowsData(rowData);
  }

  const getPackageName = (packageId) => {
    const packageDetails = packageTypes.find(pkg => pkg.id === packageId);
    return packageDetails ? packageDetails.name : "";
  }

  const getPackageDetails = (packageId) => {
    return packageTypes.find(pkg => pkg.id === packageId);;
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
            <ListTable columns={columns} rows={rowsData} onEdit={handleEdit} onDelete={handleDelete} onPackage={handlePackages} onPayment={handlePayments} tableName="Full Members List"/>
          </CardContent>
        </Card>
      </Box>
      <MemberDialog open={isDialogOpen} handleClose={onDialogClose} isEdit={isEdit}
        initialValues={initialValues}
        handleFormSubmit={handleFormSubmit}/>
      <PackageDialog open={isDialogOpenPackage} handleClose={onDialogClosePackage} isEdit={isEditPackage}
        initialValues={initialValuesPackages}
        handleFormSubmit={handleFormSubmitPackage} packageTypes={packageTypes}/>
      <PaymentDialog open={isDialogOpenPayment} handleClose={onDialogClosePayment}
        initialValues={initialValuesPayments}
        handleFormSubmit={handleFormSubmitPayment}/>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  );
};


const MemberDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit}) => {

  const validationSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email format').required("Email id is required"),
    gender: Yup.string().required('Gender is required'),
    schoolorcompanyname: Yup.string(),
    district: Yup.string().required('City is required'),
    area: Yup.string().required('Area is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string().required('Pincode is required').matches(/^[0-9]{6}$/, 'Invalid pincode'),
    coachingmembership: Yup.string(),
    primarycontactnumber: Yup.string().required('Contact is required').matches(/^[0-9]{10}$/, 'Invalid contact number'),
    secondarycontactnumber: Yup.string(),
    referredby: Yup.string(),
    isspecialchild: Yup.boolean(),
    address1: Yup.string().required('Address is required'),
    aadharUpload: Yup.mixed().nullable(),
    photoUpload: Yup.mixed().nullable(),
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <Formik initialValues={initialValues} validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({errors, touched, setFieldValue, isSubmitting, values }) => (
            console.log(errors),
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
                  <Field
                    name="email"                    
                    label="Email"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />                                    
                </div>
              </div>
              <div className='row'>
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
              </div>
              <div className='row'>
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
                <div className='form-group'>
                  <Field
                    name="secondarycontactnumber"
                    label="Alternate Contact"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.secondarycontactnumber && Boolean(errors.secondarycontactnumber)}
                    helperText={touched.secondarycontactnumber && errors.secondarycontactnumber}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start">+91</InputAdornment>)
                    }}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="referredby"
                    label="Referred By"
                    fullWidth
                    as={TextField}
                    variant="outlined"
                    error={touched.referredby && Boolean(errors.referredby)}
                    helperText={touched.referredby && errors.referredby}
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
                  label="Member Type"
                  fullWidth
                  as={TextField}
                  variant="outlined"
                  select
                  error={touched.coachingmembership && Boolean(errors.coachingmembership)}
                  helperText={touched.coachingmembership && errors.coachingmembership}
                >
                  <MenuItem value="Coaching">Coaching</MenuItem>
                  <MenuItem value="Membership">Membership</MenuItem>
                </Field>
                </div>
                <div className='form-group'>
                  <FormControl fullWidth error={touched.isspecialchild && Boolean(errors.isspecialchild)} sx={{justifyContent: "center"}}>
                    <Field name="isspecialchild">
                      {({ field }) => (
                        <FormControlLabel
                          sx={{marginLeft: "0px"}}
                          control={
                            <Checkbox
                              {...field}
                              checked={values.isspecialchild}
                              onChange={e => setFieldValue('isspecialchild', e.target.checked)}
                            />
                          }
                          label="Is Special Child"
                        />
                      )}
                    </Field>
                    {touched.isspecialchild && errors.isspecialchild && (
                      <FormHelperText>{errors.isspecialchild}</FormHelperText>
                    )}
                  </FormControl>
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <FormControl fullWidth>
                    <Typography variant="body2">Photo Upload</Typography>
                    <Input
                      type="file"
                      name="photoUpload"
                      onChange={(event) => setFieldValue('photoUpload', event.currentTarget.files[0])}
                      fullWidth
                      disabled={initialValues.photoname !== ''}
                      inputProps={{
                        style: { border: '1px solid #ccc', padding: '6px 10px' }
                      }}
                    />
                    <FormHelperText>
                      <ErrorMessage name="photoUpload" />
                    </FormHelperText>
                  </FormControl>
                  {initialValues.photoname && <Chip label={initialValues.photoname} />}
                </div>
                <div className='form-group'>
                  <FormControl fullWidth>
                    <Typography variant="body2">Aadhar Upload</Typography>
                    <Input
                      type="file"
                      name="aadharUpload"
                      onChange={(event) => setFieldValue('aadharUpload', event.currentTarget.files[0])}
                      fullWidth
                      disabled={initialValues.idproofname !== ''}
                      inputProps={{
                        style: { border: '1px solid #ccc', padding: '6px 10px' }
                      }}
                    />
                    <FormHelperText>
                      <ErrorMessage name="aadharUpload" />
                    </FormHelperText>
                  </FormControl>
                  {initialValues.idproofname && <Chip label={initialValues.idproofname} />}
                </div>
              </div>
              <div className='row save-btn'>
                <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
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


const PackageDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit, packageTypes}) => {

  const paymentTypeOnline = '22220087-c3c2-4268-a25a-13baa6f3625f';
  const paymentTypeCash = '22220087-c3c2-4268-a25a-13baa6f3625e';  
  const [slots, setSlots] = useState([]);

  const parseDate = (dateString) => {
    const parsedDate = dayjs(dateString, 'DD/MM/YYYY');
    return formatDate(parsedDate.format());
  };

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
    getSlotDetails();
  }, []);

  const calculateEndDate = (startDate, duration, durationtime) => {
    const start = dayjs(startDate, "DD/MM/YYYY");
    let endDate;
    if (duration === "Weeks") {
      endDate = start.add(durationtime, 'week');
    }
    else if (duration === "Months") {
      endDate = start.add(durationtime, 'month');
    }
    else if (duration === "Year") {
      endDate = start.add(durationtime, 'year');
    }
  
    return endDate.format('DD/MM/YYYY');
  };

  const validationSchema = Yup.object().shape({
    packageid: Yup.string().required('Package type is required'),
    packagestartdate: Yup.string().required('Package start date is required').nullable(),
    actualstartdate: Yup.string().required('Package actual start date is required').nullable(),
    packageenddate: Yup.string().required('Package end date is required').nullable(),
    actualenddate: Yup.string().required('Package actual start date is required').nullable(),
    amount: Yup.number(),
    discount: Yup.number(),
    payableamount: Yup.number(),
    paymenttype: Yup.string(),
    paymentstatus: Yup.string(),
    transactionid: Yup.string(),
    roundedpayment: Yup.number(),
    pendingamount: Yup.number(),
    notes: Yup.string(),
    slots: Yup.string().required("slots is required")
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{isEdit ? 'Edit Packages' : 'Add Packages'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik initialValues={initialValues} validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({errors, touched, handleChange, values, isSubmitting, setFieldValue, setFieldTouched}) => {
                return (
                  <Form>
                    <div className='row'>
                      <div className='form-group'>
                        <Field
                          name="packageid"
                          as={TextField}
                          label="Package Type"
                          select
                          fullWidth
                          value={values.packageid}
                          error={touched.packageid && Boolean(errors.packageid)}
                          helperText={touched.packageid && errors.packageid}
                          onChange={(e) => {
                            var data = packageTypes.filter(x=>x.id == e.target.value);
                            (data && data.length > 0) ? setFieldValue("amount", data[0].cost) : setFieldValue("amount", 0);
                            const enddate = calculateEndDate(values.packagestartdate, data[0].duration, data[0].durationtime);
                            setFieldValue("packageid", e.target.value);
                            setFieldValue("packageenddate", enddate);
                            setFieldValue("actualenddate", enddate);
                            (data && data.length > 0) ? setFieldValue("payableamount", data[0].cost) : setFieldValue("payableamount", 0);
                            (data && data.length > 0) ? setFieldValue("roundedpayment", data[0].cost) : setFieldValue("roundedpayment", 0);
                          }}
                          disabled={isEdit}
                        >
                          {packageTypes.map((packageType) => (
                            <MenuItem key={packageType.id} value={packageType.id}>{packageType.durationtime + " " + packageType.duration}</MenuItem>
                          ))}
                        </Field>
                      </div>
                      <div className='form-group'>                    
                        <Field name="packagestartdate">
                          {({ field }) => (
                            <DatePicker
                              {...field}                        
                              value={values.packagestartdate ? dayjs(values.packagestartdate, "DD/MM/YYYY") : null}
                              onChange={(date) => {
                                setFieldValue('packagestartdate', parseDate(date));
                              }}
                              inputFormat="DD/MM/YYYY"
                              sx={{width: "100%"}}
                              label="Package Start Date"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={touched.packagestartdate && Boolean(errors.packagestartdate)}
                                  helperText={touched.packagestartdate && errors.packagestartdate}
                                  placeholder="DD/MM/YYYY"                            
                                />
                              )}
                              disabled="true"
                            />
                          )}
                        </Field>
                      </div>
                      <div className='form-group'>
                        <Field name="actualstartdate">
                          {({ field }) => (
                            <DatePicker
                              {...field}
                              value={values.actualstartdate ? dayjs(values.actualstartdate, "DD/MM/YYYY") : null}
                              onChange={(date) => {
                                setFieldValue('actualstartdate', parseDate(date));
                              }}
                              inputFormat="DD/MM/YYYY"
                              sx={{width: "100%"}}
                              label="Package Actual Start Date"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={touched.actualstartdate && Boolean(errors.actualstartdate)}
                                  helperText={touched.actualstartdate && errors.actualstartdate}
                                  placeholder="DD/MM/YYYY"
                                />
                              )}
                              disabled={isEdit}
                            />
                          )}
                        </Field>
                      </div>
                    </div>
                    <div className='row'>                
                      <div className='form-group'>
                        <Field name="packageenddate">
                          {({ field }) => (
                            <DatePicker
                              {...field}
                              value={values.packageenddate ? dayjs(values.packageenddate, "DD/MM/YYYY") : null}
                              onChange={(date) => {
                                setFieldValue('packageenddate', parseDate(date));
                              }}
                              inputFormat="DD/MM/YYYY"
                              sx={{width: "100%"}}
                              label="Package End Date"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={touched.packageenddate && Boolean(errors.packageenddate)}
                                  helperText={touched.packageenddate && errors.packageenddate}
                                  placeholder="DD/MM/YYYY"
                                />
                              )}
                              disabled="true"
                            />
                          )}
                        </Field>
                      </div>
                      <div className='form-group'>                    
                        <Field name="actualenddate">
                          {({ field }) => (
                            <DatePicker
                              {...field}
                              value={values.actualenddate ? dayjs(values.actualenddate, "DD/MM/YYYY"): null}
                              onChange={(date) => {
                                setFieldValue('actualenddate', parseDate(date));
                              }}
                              inputFormat="DD/MM/YYYY"
                              sx={{width: "100%"}}
                              label="Package Actual End Date"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={touched.actualenddate && Boolean(errors.actualenddate)}
                                  helperText={touched.actualenddate && errors.actualenddate}
                                  placeholder="DD/MM/YYYY"
                                />
                              )}
                            />
                          )}
                        </Field>
                      </div>
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
                          disabled={isEdit}
                        >
                          {slots.map((slot) => (
                            <MenuItem key={slot.id} value={slot.id}>{slot.name} - {slot.time}</MenuItem>
                          ))}
                        </Field>
                      </div>                
                    </div>
                    {!isEdit && (
                      <>
                        <div className='row'>
                      <Divider sx={{margin: "15px 0px", width: "100%", fontWeight: "600"}}>Payment</Divider>
                        </div>
                        <div className='row'>
                          <div className='form-group'>
                            <Field
                              name="amount"
                              as={TextField}
                              label="Total Amount"
                              type="number"
                              fullWidth
                              value={values.amount}
                              onChange={handleChange}
                              error={touched.amount && Boolean(errors.amount)}
                              helperText={touched.amount && errors.amount}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                readOnly: true,
                              }}
                            />                        
                          </div>
                          <div className='form-group'>
                            <Field
                              name="discount"
                              as={TextField}
                              select
                              label="Discount"
                              type="number"
                              fullWidth
                              value={values.discount}
                              onChange={(e) => {
                                const discountValue = parseFloat(e.target.value) || 0;
                                const discountedAmount = values.amount - (values.amount * (discountValue / 100));
                                setFieldValue('discount', discountValue);
                                setFieldValue('payableamount', discountedAmount);
                                setFieldValue("roundedpayment", discountedAmount);
                              }}
                              error={touched.discount && Boolean(errors.discount)}
                              helperText={touched.discount && errors.discount}
                              // disabled={values.discount !== 0}
                            >
                              <MenuItem value={0}>No Discount</MenuItem>
                              <MenuItem value={5}>5%</MenuItem>
                              <MenuItem value={10}>10%</MenuItem>
                              <MenuItem value={15}>15%</MenuItem>
                              <MenuItem value={20}>20%</MenuItem>
                              <MenuItem value={25}>25%</MenuItem>
                            </Field>                      
                          </div>
                          <div className='form-group'>
                            <Field
                              name="notes"
                              as={TextField}
                              label="Notes"
                              fullWidth
                              value={values.notes}
                              onChange={handleChange}
                              error={touched.notes && Boolean(errors.notes)}
                              helperText={touched.notes && errors.notes}
                            />                        
                          </div>                       
                        </div>
                        <div className='row'>
                          <div className='form-group'>
                            <Field
                              name="payableamount"
                              as={TextField}
                              label="Payable Amount"
                              type="number"
                              fullWidth
                              value={values.payableamount}
                              onChange={handleChange}
                              error={touched.payableamount && Boolean(errors.payableamount)}
                              helperText={touched.payableamount && errors.payableamount}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                readOnly: true,
                              }}
                            />                        
                          </div>
                          <div className='form-group'>
                            <Field
                              name="paymenttype"
                              as={TextField}
                              label="Payment Type"
                              select
                              fullWidth
                              value={values.paymenttype || ''}
                              onChange={handleChange}
                              error={touched.paymenttype && Boolean(errors.paymenttype)}
                              helperText={touched.paymenttype && errors.paymenttype}
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
                              name="paymentstatus"
                              as={TextField}
                              label="Payment Status"
                              select
                              fullWidth
                              value={values.paymentstatus || ''}
                              onChange={(e) => {
                                setFieldValue('paymentstatus', e.target.value);
                                if(e.target.value == "Partial") {
                                  setFieldValue("pendingamount", (parseFloat(values.payableamount) - parseFloat(values.roundedpayment)));
                                }
                              }}
                              error={touched.paymentstatus && Boolean(errors.paymentstatus)}
                              helperText={touched.paymentstatus && errors.paymentstatus}
                            >
                              <MenuItem value="">
                                <em>Select Payment Status</em>
                              </MenuItem>
                              <MenuItem value="Paid">Paid</MenuItem>
                              <MenuItem value="Partial">Partial</MenuItem>
                              <MenuItem value="Pending">Pending</MenuItem>
                            </Field>                        
                          </div>                                     
                        </div>
                        <div className='row'>
                          <div className='form-group'>
                            <Field
                              name="roundedpayment"
                              as={TextField}
                              label="Rounded Amount"
                              type="number"
                              fullWidth
                              value={values.roundedpayment}
                              onChange={(e) => {
                                const roundedValue = parseFloat(e.target.value) || 0;
                                if(values.payableamount <  roundedValue) {
                                  setFieldValue('roundedpayment', values.payableamount);
                                  setFieldValue("pendingamount", 0);
                                } else {
                                  setFieldValue('roundedpayment', roundedValue);
                                  setFieldValue("pendingamount", (parseFloat(values.payableamount) - roundedValue));                              
                                }
                                setFieldTouched('pendingamount', true);
                              }}
                              error={touched.roundedpayment && Boolean(errors.roundedpayment)}
                              helperText={touched.roundedpayment && errors.roundedpayment}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                          </div> 
                        {values.paymenttype === paymentTypeOnline && (
                            <div className="form-group">
                              <Field
                                name="transactionid"
                                as={TextField}
                                label="Transaction ID"
                                fullWidth
                                value={values.transactionid}
                                onChange={handleChange}
                                error={touched.transactionid && Boolean(errors.transactionid)}
                                helperText={touched.transactionid && errors.transactionid}
                              />
                            </div>
                          )}
                          {values.paymentstatus === 'Partial' && (
                            <div className='form-group'>
                              <Field
                                name="pendingamount"
                                as={TextField}
                                label="Balance Amount"
                                type="number"
                                fullWidth
                                value={values.pendingamount}
                                onChange={handleChange}
                                error={touched.pendingamount && Boolean(errors.pendingamount)}
                                helperText={touched.pendingamount && errors.pendingamount}
                                InputLabelProps={{
                                  shrink: values.pendingamount !== '',
                                  readOnly: true,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </>                      
                    )}                    
                    <div className='row save-btn'>
                      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        Save Changes
                      </Button>
                    </div>
                  </Form>
                );
              }}
          </Formik>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
}

const PaymentDialog = ({open, handleClose, initialValues, handleFormSubmit}) => {
  const paymentTypeOnline = '22220087-c3c2-4268-a25a-13baa6f3625f';
  const paymentTypeCash = '22220087-c3c2-4268-a25a-13baa6f3625e';
  const [previousPayment, setPreviousPayment] = useState(0);

  const validationSchema = Yup.object().shape({
    amount: Yup.number().required('Amount is required').min(1, 'Amount must be greater than 0'),
    discount: Yup.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%'),
    payableamount: Yup.number().required('Amount is required').min(1, 'Amount must be greater than 0'),
    paymenttype: Yup.string().required('Payment type is required'),
    paymentstatus: Yup.string().required('Payment status is required'),
    transactionid: Yup.string().test(
      'transactionIdRequired',
      'Transaction ID is required',
      function(value) {
        const { paymenttype } = this.parent;
        if (paymenttype === '') {
          return value ? true : this.createError({ path: this.path, message: 'Transaction ID is required' });
        }
        return true;
      }
    ),
    roundedpayment: Yup.number().min(0, 'Rounded amount must be positive'),
    pendingamount: Yup.number()
      .when('paymentstatus', {
        is: 'Partial',
        then: (schema) => schema.required('Balance amount is required').min(0, 'Balance must be positive'),
        otherwise: (schema) => schema.notRequired(),
      }),
    notes: Yup.string(),
  });

  useEffect(() => {
    if(initialValues) {
      if(initialValues.paymentstatus === "Partial") {
        setPreviousPayment(initialValues.roundedpayment);
      }
    }
  }, [initialValues])

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>Add Payment</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <Formik initialValues={initialValues} validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({errors, touched, handleChange, values, isSubmitting, setFieldValue, setFieldTouched}) => {
              return (
                <Form>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="amount"
                        as={TextField}
                        label="Total Amount"
                        type="number"
                        fullWidth
                        value={values.amount}
                        onChange={handleChange}
                        error={touched.amount && Boolean(errors.amount)}
                        helperText={touched.amount && errors.amount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          readOnly: true,
                        }}
                      />                        
                    </div>
                    <div className='form-group'>
                      <Field
                        name="discount"
                        as={TextField}
                        select
                        label="Discount"
                        type="number"
                        fullWidth
                        value={values.discount}
                        onChange={(e) => {
                          const discountValue = parseFloat(e.target.value) || 0;
                          const discountedAmount = values.amount - (values.amount * (discountValue / 100));
                          setFieldValue('discount', discountValue);
                          setFieldValue('payableamount', discountedAmount);
                          setFieldValue("roundedpayment", discountedAmount);
                        }}
                        error={touched.discount && Boolean(errors.discount)}
                        helperText={touched.discount && errors.discount}
                        disabled={values.discount !== 0}
                      >
                        <MenuItem value={0}>No Discount</MenuItem>
                        <MenuItem value={5}>5%</MenuItem>
                        <MenuItem value={10}>10%</MenuItem>
                        <MenuItem value={15}>15%</MenuItem>
                        <MenuItem value={20}>20%</MenuItem>
                        <MenuItem value={25}>25%</MenuItem>
                      </Field>
                    </div>
                    <div className='form-group'>
                      <Field
                        name="notes"
                        as={TextField}
                        label="Notes"
                        fullWidth
                        value={values.notes}
                        onChange={handleChange}
                        error={touched.notes && Boolean(errors.notes)}
                        helperText={touched.notes && errors.notes}
                        disabled={values.discount !== 0}
                      />                        
                    </div>                       
                  </div>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="payableamount"
                        as={TextField}
                        label="Rounded Amount"
                        type="number"
                        fullWidth
                        value={values.payableamount}
                        onChange={handleChange}
                        error={touched.payableamount && Boolean(errors.payableamount)}
                        helperText={touched.payableamount && errors.payableamount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          readOnly: true,
                        }}
                      />                        
                    </div>
                    <div className='form-group'>
                      <Field
                        name="paymenttype"
                        as={TextField}
                        label="Payment Type"
                        select
                        fullWidth
                        value={values.paymenttype || ''}
                        onChange={handleChange}
                        error={touched.paymenttype && Boolean(errors.paymenttype)}
                        helperText={touched.paymenttype && errors.paymenttype}
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
                        name="paymentstatus"
                        as={TextField}
                        label="Payment Status"
                        select
                        fullWidth
                        value={values.paymentstatus || ''}
                        onChange={(e) => {
                          setFieldValue('paymentstatus', e.target.value);
                          if(e.target.value == "Partial") {
                            setFieldValue("pendingamount", (parseFloat(values.payableamount) - parseFloat(values.roundedpayment)));
                          }
                        }}
                        error={touched.paymentstatus && Boolean(errors.paymentstatus)}
                        helperText={touched.paymentstatus && errors.paymentstatus}
                      >
                        <MenuItem value="">
                          <em>Select Payment Status</em>
                        </MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Partial">Partial</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Field>                        
                    </div>                                     
                  </div>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="roundedpayment"
                        as={TextField}
                        label="Payable Amount"
                        type="number"
                        fullWidth
                        value={values.roundedpayment}
                        onChange={(e) => {
                          const roundedValue = Number(parseFloat(e.target.value) || 0);
                          if(values.payableamount <  roundedValue) {
                            setFieldValue('roundedpayment', values.payableamount);
                            setFieldValue("pendingamount", 0);
                          } else {
                            setFieldValue('roundedpayment', roundedValue);
                            if(previousPayment !== 0) {
                              setFieldValue("pendingamount", (parseFloat(previousPayment) - roundedValue));
                            } else {
                              setFieldValue("pendingamount", (parseFloat(values.payableamount) - roundedValue));
                            }                            
                          }                          
                          setFieldTouched('pendingamount', true);
                        }}
                        error={touched.roundedpayment && Boolean(errors.roundedpayment)}
                        helperText={touched.roundedpayment && errors.roundedpayment}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </div> 
                    {values.paymenttype === paymentTypeOnline && (
                      <div className="form-group">
                        <Field
                          name="transactionid"
                          as={TextField}
                          label="Transaction ID"
                          fullWidth
                          value={values.transactionid}
                          onChange={handleChange}
                          error={touched.transactionid && Boolean(errors.transactionid)}
                          helperText={touched.transactionid && errors.transactionid}
                        />
                      </div>
                    )}
                    {values.paymentstatus === 'Partial' && (
                      <div className='form-group'>
                        <Field
                          name="pendingamount"
                          as={TextField}
                          label="Balance Amount"
                          type="number"
                          fullWidth
                          value={values.pendingamount}
                          onChange={handleChange}
                          error={touched.pendingamount && Boolean(errors.pendingamount)}
                          helperText={touched.pendingamount && errors.pendingamount}
                          InputLabelProps={{
                            shrink: values.pendingamount !== '',
                            readOnly: true,
                          }}
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
              );
            }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default Members;