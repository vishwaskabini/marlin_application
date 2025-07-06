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
import ListTableCustom from '../../common/components/DataGrid';

dayjs.extend(customParseFormat);

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

const convertToDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
};

const formatLocalDateToString = (date) => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

const Members = () => {
  const [membersExpiringToday, setMembersExpiringToday] = useState([]);
  const [membersExpiringIn5Days, setMembersExpiringIn5Days] = useState([]);
  const [membersRegisteredToday, setMembersRegisteredToday] = useState([]);
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
  const [isDialogOpenViewDetails, setIsDialogOpenViewDetails] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditPackage, setIsEditPackage] = useState(false);
  const [isActivePackage, setIsActivePackage] = useState(false);
  const [selectedMember, setSelectedMember] = useState();
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
      referredby: data.referredby,
      hardwareuserid: data.hardwareuserid,
      rfidnumber: data.rfidnumber,
      registereddate: data.registereddate
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
          paymentstatus: item.packagepaymentDetails && item.packagepaymentDetails.length > 0 ? item.packagepaymentDetails[item.packagepaymentDetails.length -1].paymentstatus : "Pending",
          payment: item.packagepaymentDetails && item.packagepaymentDetails.length > 0 ? item.packagepaymentDetails[0].amount : "",
          package: item.packageDetails && item.packageDetails.length > 0 ? getPackageName(item.packageDetails[0].packageid) : "",
          packageenddate: item.packageDetails && item.packageDetails.length > 0 ? formatDate(item.packageDetails[0].actualenddate) : "",
          paymentstatusAction: item.packagepaymentDetails && item.packagepaymentDetails.length > 0 && item.packagepaymentDetails[item.packagepaymentDetails.length - 1].paymentstatus === "Paid" ? true : false,
          registereddate: item.registereddate
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
      setMembersRegisteredToday(membersData.filter((item) => {
        if(item.registereddate) {
          const registeredDate = new Date(item.registereddate);
          const currentDate = new Date();
          return (
            registeredDate.getFullYear() === currentDate.getFullYear() &&
            registeredDate.getMonth() === currentDate.getMonth() &&
            registeredDate.getDate() === currentDate.getDate()
          );
        }
        return false;        
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

  const onDialogCloseViewDetails = () => {
    setIsDialogOpenViewDetails(false);
  }

  const handleFormSubmit = (values) => {
    values.registereddate = formatLocalDateToString(convertToDate(values.registereddate));
    console.log(values);
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
    values.packagestartdate = formatLocalDateToString(convertToDate(values.packagestartdate));
    values.actualstartdate = formatLocalDateToString(convertToDate(values.actualstartdate));
    values.packageenddate = formatLocalDateToString(convertToDate(values.packageenddate));
    values.actualenddate = formatLocalDateToString(convertToDate(values.actualenddate));
    const packegeObj = {
      userid: values.userid,
      packageid: values.packageid,
      packagestartdate: values.packagestartdate,
      packageenddate: values.packageenddate,
      actualstartdate: values.actualstartdate,
      actualenddate: values.actualenddate,
      id: values.id,
      timeslotid: values.timeslotid,
      userpackagestatusid: values.userpackagestatusid
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
        updateSlot(values, data);
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while create payment" + error, {
          position: "top-right"
        });
      });
    }
  }

  const handleFormSubmitPayment = (values) => {
    if (values.paymentstatus.toLowerCase() === "paid" && values.pendingamount > 0) {
      const additionalDiscount = (values.pendingamount / values.amount) * 100;
      values.discount += additionalDiscount;
      values.pendingamount = 0;
    }
    addPayment(values, true);
  }

  const updateSlot = (values, id) => {
    var data = {
      userid: values.userid,
      timeslotid: values.timeslotid,
      startDate: values.actualstartdate,
      endDate: values.actualenddate,
      userpackagemappingid: id
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
    values.paymentdate = formatLocalDateToString(convertToDate(values.paymentdate));
    values.reminderdate = formatLocalDateToString(convertToDate(values.reminderdate));    
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
      reminderdate: values.reminderdate,
      paymentdate: values.paymentdate
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
    addEditPackage(data, true);
  }

  const addEditPackage = (data, isActive) => {    
    setIsActivePackage(isActive);
    const isEditMode = isActive ? (data.packageDetails && data.packageDetails.length > 0) : (data.packageDetails && data.packageDetails.length > 1);
    setIsEditPackage(isEditMode);

    const packageDetails = isEditMode 
      ? (!isActive && data.packageDetails.length == 2 ? data.packageDetails[1] : data.packageDetails[0]) 
      : null;

    if(isEditMode) {      
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
        paymentstatus: 'Paid',
        pendingamount: 0,
        transactionid: '',
        notes: '',
        timeslotid: packageDetails.timeslotid,
        userpackagestatusid: isActive  ? "06cd1d96-f85d-49cd-9d09-bfa7d6825d2b" : '3159aa8b-6bdd-4b34-9fc4-4a618e363fb2',
        reminderdate: dayjs().format('DD/MM/YYYY'),
        paymentdate: dayjs().format('DD/MM/YYYY')
      });
    } else {
      setInitialValuesPackages({
        id: '',
        userid: data.id,
        packageid: '',
        packagestartdate: isActive ? dayjs().format('DD/MM/YYYY') : dayjs(data.packageDetails[0].actualenddate).add(1, 'day').format('DD/MM/YYYY'),
        actualstartdate: isActive ? dayjs().format('DD/MM/YYYY') : dayjs(data.packageDetails[0].actualenddate).add(1, 'day').format('DD/MM/YYYY'),
        packageenddate: '',
        actualenddate: '',
        amount: 0,
        discount: 0,
        payableamount: 0,
        roundedpayment: 0,
        paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
        paymentstatus: 'Paid',
        pendingamount: 0,
        transactionid: '',
        notes: '',
        timeslotid: '',
        userpackagestatusid: isActive  ? "06cd1d96-f85d-49cd-9d09-bfa7d6825d2b" : '3159aa8b-6bdd-4b34-9fc4-4a618e363fb2',
        reminderdate: dayjs().format('DD/MM/YYYY'),
        paymentdate: dayjs().format('DD/MM/YYYY')
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
          userpackagemappingid: paymentDetails[0].userpackagemappingid,
          amount: paymentDetails[0].amount,
          discount: paymentDetails[0].discount,
          payableamount: paymentDetails[0].payableamount,
          roundedpayment: paymentDetails[0].pendingamount,
          paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
          paymentstatus: paymentDetails[0].paymentstatus,
          pendingamount: 0,
          transactionid: '',
          notes: paymentDetails[0].notes,
          paymentdate: paymentDetails[0].paymentdate ?? dayjs().format('DD/MM/YYYY'),
          reminderdate: paymentDetails[0].reminderdate ?? dayjs().format('DD/MM/YYYY')
        });
      } else {
        setInitialValuesPayments({
          userpackagemappingid: data.packageDetails[0].userpackagemappingid,
          amount: packageDetails.cost,
          discount: 0,
          payableamount: packageDetails.cost,
          roundedpayment: packageDetails.cost,
          paymenttype: '22220087-c3c2-4268-a25a-13baa6f3625e',
          paymentstatus: 'Paid',
          pendingamount: 0,
          transactionid: '',
          notes: '',
          paymentdate: dayjs().format('DD/MM/YYYY'),
          reminderdate: dayjs().format('DD/MM/YYYY')
        });
      }      
      setIsDialogOpenPayment(true);
    } else {
      toast.error("No valid packages available, Please add package before making payment", {
        position: "top-right"
      });
    }
  }

  const handleUpcomingPackages = (id) => {
    var data = members.find(item => item.id == id);
    if(data.packageDetails && data.packageDetails.length > 0){
      addEditPackage(data, false);
    } else {
      toast.error("No valid packages available, Please add package before making renewal", {
        position: "top-right"
      });
    }    
  }

  const handleViewDetails = (id) => {
    const member = allMembers.filter(m => m.id === id);
    setSelectedMember(member[0]);
    setIsDialogOpenViewDetails(true);
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
      photoname: '',
      hardwareuserid: '',
      rfidnumber: '',
      registereddate: dayjs().format('DD/MM/YYYY')
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
                <Typography variant="h6" color="textSecondary" className='members-summary-text'>All</Typography>
                <Typography variant="h5">{allMembers.length}</Typography>
              </Box>              
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(activeMembers)}>
            <CardContent className='members-summary-div'>
              <img src='/img/active.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary" className='members-summary-text'>Active</Typography>
                <Typography variant="h5">{activeMembers.length}</Typography>
              </Box>              
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(membersRegisteredToday)}>
            <CardContent className='members-summary-div'>
              <img src='/img/registered.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary" className='members-summary-text'>Registered Today</Typography>
                <Typography variant="h5">{membersRegisteredToday.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(membersExpiringToday)}>
            <CardContent className='members-summary-div member-summary-fullwidth'>
              <img src='/img/subscribe.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary" className='members-summary-text'>Expiring Today</Typography>
                <Typography variant="h5">{membersExpiringToday.length}</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ width: "19%", cursor: "pointer" }} onClick={() => handleSummary(membersExpiringIn5Days)}>
            <CardContent className='members-summary-div member-summary-fullwidth'>
              <img src='/img/subscription-model.png' className='summary-image'/>
              <Box className='members-summary'>
                <Typography variant="h6" color="textSecondary" className='members-summary-text'>Expiring in 5 Days</Typography>
                <Typography variant="h5">{membersExpiringIn5Days.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            {/* <ListTable columns={columns} rows={rowsData} onEdit={handleEdit} onDelete={handleDelete} onPackage={handlePackages} onPayment={handlePayments} onViewDetails={handleViewDetails} onUpcomingPackage={handleUpcomingPackages} tableName="Full Members List"/> */}
            <ListTableCustom columns={columns} rows={rowsData} onEdit={handleEdit} onDelete={handleDelete} onPackage={handlePackages} onPayment={handlePayments} onViewDetails={handleViewDetails} onUpcomingPackage={handleUpcomingPackages} tableName="Full Members List"/>
          </CardContent>
        </Card>
      </Box>
      <MemberDialog open={isDialogOpen} handleClose={onDialogClose} isEdit={isEdit}
        initialValues={initialValues}
        handleFormSubmit={handleFormSubmit}/>
      <PackageDialog open={isDialogOpenPackage} handleClose={onDialogClosePackage} isEdit={isEditPackage}
        initialValues={initialValuesPackages}
        handleFormSubmit={handleFormSubmitPackage} packageTypes={packageTypes} isActivePackage={isActivePackage}/>      
      <PaymentDialog open={isDialogOpenPayment} handleClose={onDialogClosePayment}
        initialValues={initialValuesPayments}
        handleFormSubmit={handleFormSubmitPayment}/>
      <ViewDetailsDialog open={isDialogOpenViewDetails} handleClose={onDialogCloseViewDetails} selectedMember={selectedMember}
        getPackageName={getPackageName}/>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  );
};

const MemberDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit}) => {

  const parseDate = (dateString) => {
    const parsedDate = dayjs(dateString, 'DD/MM/YYYY');
    return formatDate(parsedDate.format());
  };

  const validationSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string(),
    email: Yup.string(),
    gender: Yup.string(),
    schoolorcompanyname: Yup.string(),
    district: Yup.string(),
    area: Yup.string(),
    state: Yup.string(),
    pincode: Yup.string().matches(/^[0-9]{6}$/, 'Invalid pincode'),
    coachingmembership: Yup.string(),
    primarycontactnumber: Yup.string().required('Contact is required').matches(/^[0-9]{10}$/, 'Invalid contact number'),
    secondarycontactnumber: Yup.string(),
    referredby: Yup.string(),
    isspecialchild: Yup.boolean(),
    address1: Yup.string(),
    aadharUpload: Yup.mixed().nullable(),
    photoUpload: Yup.mixed().nullable(),
    rfidnumber: Yup.string(),
    hardwareuserid: Yup.string(),
    registereddate: Yup.string()
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                    <Field
                      name="rfidnumber"
                      label="RFID Number"
                      fullWidth
                      as={TextField}
                      variant="outlined"
                      error={touched.rfidnumber && Boolean(errors.rfidnumber)}
                      helperText={touched.rfidnumber && errors.rfidnumber}
                    />
                  </div>
                  <div className='form-group'>
                    <Field
                      name="hardwareuserid"
                      label="Harware User Id"
                      fullWidth
                      as={TextField}
                      variant="outlined"
                      error={touched.hardwareuserid && Boolean(errors.hardwareuserid)}
                      helperText={touched.hardwareuserid && errors.hardwareuserid}
                    />
                  </div>
                  <div className='form-group'>                    
                    <Field name="registereddate">
                      {({ field }) => (
                        <DatePicker
                          {...field}                        
                          value={values.registereddate ? dayjs(values.registereddate, "DD/MM/YYYY") : null}
                          onChange={(date) => {
                            setFieldValue('registereddate', parseDate(date));
                          }}
                          inputFormat="DD/MM/YYYY"
                          sx={{width: "100%"}}
                          label="Registration Date"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={touched.registereddate && Boolean(errors.registereddate)}
                              helperText={touched.registereddate && errors.registereddate}
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
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
}

const PackageDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit, packageTypes, isActivePackage}) => {

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
    timeslotid: Yup.string().required("slots is required"),
    userpackagestatusid: Yup.string(),
    reminderdate: Yup.string().required('Reminder date is required'),
    paymentdate: Yup.string().required('Payment date is required')
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>{isEdit ? 'Edit Packages' : 'Add Packages'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik initialValues={initialValues} validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({errors, touched, handleChange, values, isSubmitting, setFieldValue, setFieldTouched, handleSubmit }) => {
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
                            <MenuItem key={packageType.id} value={packageType.id}>{packageType.name + " " + packageType.durationtime + " " + packageType.duration + " - " + packageType.cost}</MenuItem>
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
                                var data = packageTypes.filter(x=>x.id == values.packageid);
                                const enddate = calculateEndDate(parseDate(date), data[0].duration, data[0].durationtime);
                                setFieldValue("packageenddate", enddate);
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
                              disabled={!isActivePackage}
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
                                var data = packageTypes.filter(x=>x.id == values.packageid);
                                const enddate = calculateEndDate(parseDate(date), data[0].duration, data[0].durationtime);                                
                                setFieldValue("actualenddate", enddate);
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
                              disabled={!isActivePackage}
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
                          name="timeslotid"
                          as={TextField}
                          label="Time Slots"
                          select
                          fullWidth
                          value={values.timeslotid}
                          onChange={handleChange}
                          error={touched.timeslotid && Boolean(errors.timeslotid)}
                          helperText={touched.timeslotid && errors.timeslotid}
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
                              disabled="true"
                            >
                              <MenuItem value="">
                                <em>Select Payment Status</em>
                              </MenuItem>
                              <MenuItem value="Paid">Paid</MenuItem>
                              <MenuItem value="Partial">Partial</MenuItem>
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
                                const inputValue = e.target.value;
                                if (inputValue === "") {
                                  setFieldValue("roundedpayment", "");
                                  setFieldValue("pendingamount", parseFloat(values.payableamount));
                                  setFieldValue("paymentstatus", "Partial");
                                  return;
                                }
                                const roundedValue = parseFloat(inputValue) || 0;
                                if(parseFloat(values.payableamount) <=  roundedValue) {
                                  setFieldValue('roundedpayment', values.payableamount);
                                  setFieldValue("pendingamount", 0);
                                  setFieldValue("paymentstatus", "Paid");
                                } else {
                                  setFieldValue('roundedpayment', roundedValue);
                                  setFieldValue("pendingamount", (parseFloat(values.payableamount) - roundedValue));
                                  setFieldValue("paymentstatus", "Partial");
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
                          <div className='form-group'>
                            <Field
                              name="pendingamount"
                              as={TextField}
                              label="Balance Amount"
                              type="number"
                              fullWidth
                              value={values.pendingamount}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                const pendingValue = parseFloat(inputValue) || 0;
                                setFieldValue("pendingamount", pendingValue);
                                if(pendingValue == 0) {
                                  setFieldValue("paymentstatus", "Paid");
                                }
                              }}
                              error={touched.pendingamount && Boolean(errors.pendingamount)}
                              helperText={touched.pendingamount && errors.pendingamount}
                              InputLabelProps={{
                                shrink: values.pendingamount !== '',                                  
                              }}
                            />
                          </div>
                        </div>
                        <div className='row'>
                          <div className='form-group'>
                            <Field name="paymentdate">
                              {({ field }) => (
                                <DatePicker
                                  {...field}                        
                                  value={values.paymentdate ? dayjs(values.paymentdate, "DD/MM/YYYY") : null}
                                  onChange={(date) => {
                                    setFieldValue('paymentdate', parseDate(date));
                                  }}
                                  inputFormat="DD/MM/YYYY"
                                  sx={{width: "100%"}}
                                  label="Payment Date"                                  
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      error={touched.paymentdate && Boolean(errors.paymentdate)}
                                      helperText={touched.paymentdate && errors.paymentdate}
                                      placeholder="DD/MM/YYYY"                            
                                    />
                                  )}
                                />
                              )}
                            </Field>
                          </div>
                          <div className='form-group'>
                            <Field name="reminderdate">
                              {({ field }) => (
                                <DatePicker
                                  {...field}                        
                                  value={values.reminderdate ? dayjs(values.reminderdate, "DD/MM/YYYY") : null}
                                  onChange={(date) => {
                                    setFieldValue('reminderdate', parseDate(date));
                                  }}
                                  inputFormat="DD/MM/YYYY"
                                  sx={{width: "100%"}}
                                  label="Reminder Date"
                                  disabled={values.paymentstatus === "Paid"}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      error={touched.reminderdate && Boolean(errors.reminderdate)}
                                      helperText={touched.reminderdate && errors.reminderdate}
                                      placeholder="DD/MM/YYYY"                            
                                    />
                                  )}
                                />
                              )}
                            </Field>
                          </div>
                        </div>
                      </>                      
                    )}                    
                    <div className='row save-btn div-package-btns'>
                      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        Save Changes
                      </Button>
                      {isActivePackage && isEdit && (
                        <>
                          <Button variant="contained" color="success" 
                            onClick={() => {
                              setFieldValue("userpackagestatusid", "e332f582-46df-4ab9-b8bb-da0cb4c654c0");
                              handleSubmit();
                            }}>
                            Complete
                          </Button>
                          <Button variant="contained" color="error" 
                            onClick={() => {
                              setFieldValue("userpackagestatusid", "e5292250-2be0-4774-ace0-db4428640ec2");
                              handleSubmit();
                            }}>
                            Abort
                          </Button>                      
                        </>
                      )}
                      {!isActivePackage && isEdit && (
                        <>
                          <Button variant="contained" color="inherit" 
                            onClick={() => {
                              setFieldValue("userpackagestatusid", "0b966226-9369-40bb-ae1e-995c4001d178");
                              handleSubmit();
                            }}>
                            Cancel
                          </Button>                     
                        </>
                      )}
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

  const parseDate = (dateString) => {
    const parsedDate = dayjs(dateString, 'DD/MM/YYYY');
    return formatDate(parsedDate.format());
  };

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
    reminderdate: Yup.string().required('Reminder date is required'),
    paymentdate: Yup.string().required('Payment date is required')
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
                            const inputValue = e.target.value;
                            if (inputValue === "") {
                              setFieldValue("roundedpayment", "");
                              setFieldValue("pendingamount", previousPayment);
                              setFieldValue("paymentstatus", "Partial");
                              return;
                            }
                            const roundedValue = Number(parseFloat(inputValue) || 0);
                            if(parseFloat(values.payableamount) <=  roundedValue) {
                              setFieldValue('roundedpayment', values.payableamount);
                              setFieldValue("pendingamount", 0);
                              setFieldValue("paymentstatus", "Paid");
                            } else {
                              setFieldValue('roundedpayment', roundedValue);                            
                              if(previousPayment !== 0) {
                                setFieldValue("pendingamount", (parseFloat(previousPayment) - roundedValue));
                                ((parseFloat(previousPayment) - roundedValue) === 0) ? setFieldValue("paymentstatus", "Paid") : setFieldValue("paymentstatus", "Partial");
                              } else {
                                setFieldValue("pendingamount", (parseFloat(values.payableamount) - roundedValue));
                                ((parseFloat(values.payableamount) - roundedValue) === 0) ? setFieldValue("paymentstatus", "Paid") : setFieldValue("paymentstatus", "Partial");
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
                      <div className='form-group'>
                        <Field
                          name="pendingamount"
                          as={TextField}
                          label="Balance Amount"
                          type="number"
                          fullWidth
                          value={values.pendingamount}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const pendingValue = parseFloat(inputValue) || 0;
                            setFieldValue("pendingamount", pendingValue);
                            if(pendingValue == 0) {
                              setFieldValue("paymentstatus", "Paid");
                            }
                          }}
                          error={touched.pendingamount && Boolean(errors.pendingamount)}
                          helperText={touched.pendingamount && errors.pendingamount}
                          InputLabelProps={{                            
                            shrink: values.pendingamount !== '',                            
                          }}
                        />
                      </div>
                    </div>  
                    <div className='row'>
                      <div className='form-group'>
                        <Field name="paymentdate">
                          {({ field }) => (
                            <DatePicker
                              {...field}                        
                              value={values.paymentdate ? dayjs(values.paymentdate, "DD/MM/YYYY") : null}
                              onChange={(date) => {
                                setFieldValue('paymentdate', parseDate(date));
                              }}
                              inputFormat="DD/MM/YYYY"
                              sx={{width: "100%"}}
                              label="Payment Date"                              
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={touched.paymentdate && Boolean(errors.paymentdate)}
                                  helperText={touched.paymentdate && errors.paymentdate}
                                  placeholder="DD/MM/YYYY"                            
                                />
                              )}
                            />
                          )}
                        </Field>
                      </div>
                      <div className='form-group'>
                        <Field name="reminderdate">
                          {({ field }) => (
                            <DatePicker
                              {...field}                        
                              value={values.reminderdate ? dayjs(values.reminderdate, "DD/MM/YYYY") : null}
                              onChange={(date) => {
                                setFieldValue('reminderdate', parseDate(date));
                              }}
                              inputFormat="DD/MM/YYYY"
                              sx={{width: "100%"}}
                              label="Reminder Date"
                              disabled={values.paymentstatus === "Paid"}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={touched.reminderdate && Boolean(errors.reminderdate)}
                                  helperText={touched.reminderdate && errors.reminderdate}
                                  placeholder="DD/MM/YYYY"                            
                                />
                              )}
                            />
                          )}
                        </Field>
                      </div>
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
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
}

const ViewDetailsDialog = ({open, handleClose, selectedMember, getPackageName}) => {
  const [packageDetails, setPackageDetails] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);

  const packageColumns = [
    { id: 'packageName', label: 'Package' },
    { id: 'actualstartdate', label: 'Actual Start Date' },
    { id: 'actualenddate', label: 'Actual End Date' }
  ];
  const paymentColumns = [
      { id: 'updateddate', label: 'Payment Date' },
      { id: 'roundedpayment', label: 'Amount Paid' },
      { id: 'pendingamount', label: 'Balance Amount' },
      { id: 'paymentstatus', label: 'Payment Status' }
  ];
  const attendanceColumns = [
      { id: 'scheduledDate', label: 'Schedule Date' },
      { id: 'scheduledTime', label: 'Schedule Time' },
      { id: 'hardwareCheckinDate', label: 'Hardware Checkin Date' },
      { id: 'hardwareCheckinTime', label: 'Hardware Checkin Time' }
      
  ];
  const attendanceSummaryColumns = [
    { id: 'totalregisteredclass', label: 'Total Registered Classes' },
    { id: 'totalactualattendendclass', label: 'Total Attended Classes' },
    { id: 'totalmissedclass', label: 'Total Missed Classes' }
  ];


  const getMemberAttendanceDetails = () => {
    apiClient.get("/api/HardwareAttendance/GetHardwareAttendance?userId="+selectedMember.id).then((data) => {
      setAttendanceDetails(data);
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  const getMemberAttendanceSummary = () => {
    apiClient.get("/api/AttendanceSummary/GetAttendanceSummary?userId="+selectedMember.id).then((data) => {
      setAttendanceSummary([data]);
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  const getMemberDetails = () => {
    apiClient.get("/api/Users/GetAllWithDetailsByUserId?userId="+selectedMember.id).then((data) => {
      if(data[0].packageDetails && data[0].packagepaymentDetails) {
        const formattedDataPackage = data[0].packageDetails.map((item) => ({
          ...item,
          packageName: getPackageName(item.packageid),
          actualstartdate: dayjs(item.updateddate).format("DD/MM/YYYY"),
          actualenddate: dayjs(item.updateddate).format("DD/MM/YYYY")
        }));        
        setPackageDetails(formattedDataPackage);      
        const formattedData = data[0].packagepaymentDetails.map((item) => ({
          ...item,
          updateddate: dayjs(item.updateddate).format("DD/MM/YYYY")
        }));
        setPaymentDetails(formattedData);
      }
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    if(selectedMember) {
      getMemberAttendanceSummary();
      getMemberDetails();
      getMemberAttendanceDetails();
    }    
  }, [selectedMember])

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: "80%"}}}>
      <DialogTitle>View Details - {selectedMember?.name}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <Typography variant='h5' className='header-text'>Package Details
            </Typography>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <ListTable columns={packageColumns} rows={packageDetails} tableName="Package Details" showSearch={false}/>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <Typography variant='h5' className='header-text'>Payment Details
            </Typography>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <ListTable columns={paymentColumns} rows={paymentDetails} tableName="Payment Details" showSearch={false}/>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <Typography variant='h5' className='header-text'>Attendance Summary
            </Typography>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <ListTable columns={attendanceSummaryColumns} rows={attendanceSummary} tableName="Attendance Summary" showSearch={false}/>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <Typography variant='h5' className='header-text'>Attendance Details
            </Typography>
          </Box>
        </div>
        <div className='row'>
          <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
            <ListTable columns={attendanceColumns} rows={attendanceDetails} tableName="Attendance Details" showSearch={false}/>
          </Box>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Members;