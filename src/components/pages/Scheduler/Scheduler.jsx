import React, { useEffect, useState } from 'react';
import { Typography, Paper, Chip, IconButton, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid2 as Grid, Card, CardContent, Autocomplete, DialogContentText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import apiClient from '../../services/apiClientService';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import { toast } from 'react-toastify';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const convertToDateUTC = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
};

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

const Scheduler = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [slots, setSlots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const totalSlots = 50;

  const getTimeSlots = () => {
    setIsLoading(true);
    apiClient.get("/api/Timeslots").then((data) => {      
      var batchdata = data.sort(sortByStartTime)      
      setSlots(batchdata);
      initializeAvailableSlots(batchdata);
      setSelectedDate(dayjs());
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  const convertDate = (date) => {
    return dayjs(date).tz('Asia/Kolkata').format('YYYY-MM-DDT00:00:00');
  };

  const getAssignedUsers = (selectDate) => {
    if(selectDate !== "Invalid Date") {
      setIsLoading(true);
      apiClient.get("/api/UsersScheduleMapping/GetAllByDateRange?fromDate="+selectDate+"&toDate="+selectDate).then((data) => {
        const transformedData = data.reduce((acc, {timeslotid, userid, userName, id}) => {
          if (!acc[timeslotid]) {
            acc[timeslotid] = [];
          }
          acc[timeslotid].push({
            userid: userid,
            id: id,
            name: userName
          });
          return acc;
        }, {});
        updateAvailableSlots(transformedData);
        setAssignedMembers(transformedData);
        setIsLoading(false);
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while get " + error, {
          position: "top-right"
        });
      });
    }    
  }

  const convertToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;    
    return totalMinutes;
  };

  const sortByStartTime = (a, b) => {
    const [startA] = a.name.split("-");
    const [startB] = b.name.split("-");
    const startMinutesA = convertToMinutes(startA);
    const startMinutesB = convertToMinutes(startB);
    return startMinutesA - startMinutesB;
  };

  useEffect(() => {
    getAssignedUsers(convertDate(selectedDate));
  },[selectedDate])

  useEffect(() => {
    getTimeSlots();
    setInitialValues({
      startDate: dayjs().format('DD/MM/YYYY'),
      endDate: dayjs().format('DD/MM/YYYY')
    })   
  }, []);

  const initializeAvailableSlots = (slots) => {
    const initialAvailableSlots = {};
    [...slots].forEach(slot => {
      initialAvailableSlots[slot.id] = 50;
    });
    setAvailableSlots(initialAvailableSlots);
  }

  const updateAvailableSlots = (transformedData) => {
    const updatedSlots = Object.keys(transformedData).reduce((acc, timeslotid) => {
      acc[timeslotid] = Math.max(totalSlots - transformedData[timeslotid].length, 0);
      return acc;
    }, {});
    setAvailableSlots(updatedSlots);
  };

  const handleRemoveMember = (slot, userScheduleId) => {
    setSelectedRow({slot: slot, userScheduleId: userScheduleId});
    setOpen(true);     
  };

  const handleConfirmDelete = () => {
    if(selectedRow) {
      setOpen(false);
      setIsLoading(true);
      apiClient.delete("/api/UsersScheduleMapping/"+selectedRow.userScheduleId).then(() =>{
        setAssignedMembers((prevAssignedMembers) => {
          const updatedMembers = {
            ...prevAssignedMembers,
            [selectedRow.slot]: prevAssignedMembers[selectedRow.slot]?.filter((member) => member.id !== selectedRow.userScheduleId),
          };
          return updatedMembers;
        });
    
        setAvailableSlots((prevAvailableSlots) => {
          const updatedAvailableSlots = { ...prevAvailableSlots, [selectedRow.slot]: prevAvailableSlots[selectedRow.slot] + 1 };
          return updatedAvailableSlots;
        });
        setIsLoading(false);
        toast.success("Removed User for Slot Successfully !", {
          position: "top-right"
        });
      }).catch((error) =>{
        setIsLoading(false);
        toast.error("Error while delete " + error, {
          position: "top-right"
        });
      });
    }
  }

  const handleDateChange = (newDate) => {
    setSelectedDate(dayjs(newDate));
  };

  const handleOpenDialog = (slot) => {
    setSelectedSlot(slot.name);
    setSelectedSlotId(slot.id)
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseConfirm = () => {
    setOpen(false);
  }

  const handleFormSubmit = (values) => {
    values.startDate = dayjs(values.startDate, "DD/MM/YYYY").format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    values.endDate = dayjs(values.endDate, "DD/MM/YYYY").format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    var data = {
      userid: values.memberName,
      timeslotid: selectedSlotId,
      startDate: values.startDate,
      endDate: values.endDate
    }
    apiClient.post("/api/UsersScheduleMapping/createDateRange", data).then((result) =>  {
      getAssignedUsers(convertDate(selectedDate));
      setOpenDialog(false);
      toast.success("Schedule Added Successfully !", {
        position: "top-right"
      });
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while create payment" + error, {
        position: "top-right"
      });
    });    
    setOpenDialog(false);
  };

  const handlePrevDate = () => {
    setSelectedDate((prevDate) => prevDate.subtract(1, 'day'));
  };

  const handleNextDate = () => {
    setSelectedDate((prevDate) => prevDate.add(1, 'day'));
  };

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Typography variant='h5' className='header-text'>
            Scheduler
            <Box display="flex" justifyContent="space-between" alignItems="center" ml={"auto"}>
              <IconButton onClick={handlePrevDate} color="primary">
                <ArrowBackIosIcon />
              </IconButton>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <IconButton onClick={handleNextDate} color="primary">
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Typography>
        </Box>

        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <Box display="flex" flexWrap="wrap" gap={2} p={2}>
              {slots?.map((slot, index) => (
                <Box key={index} width="32.5%" mb={2}>
                  <Paper
                    elevation={3}
                    style={{
                      padding: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f5f5f5',
                      color: '#000',
                      position: 'relative',
                      height: "200px"
                    }}
                    onClick={() => setSelectedSlot(slot.name)}
                  >
                    <IconButton
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#1976d2',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(slot);
                      }}
                      disabled={assignedMembers[slot.id]?.length >= 50}
                    >
                      <AddIcon />
                    </IconButton>

                    <Typography variant="body1">{slot.name}</Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px' }}>
                      Available Slots: {availableSlots[slot.id]}
                    </Typography>

                    {assignedMembers[slot.id] && assignedMembers[slot.id].length > 0 && (
                      <div style={{ marginTop: '10px', textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                        {assignedMembers[slot.id].map((member, index) => (
                          <Chip
                            key={member.userid+index}
                            label= {member.name}
                            onDelete={() => handleRemoveMember(slot.id, member.id)}
                            color="primary"
                            style={{ margin: '5px' }}
                          />
                        ))}
                      </div>
                    )}
                  </Paper>
                </Box>
              ))}
            </Box>            
          </CardContent>
        </Card>
        <AssignMemberDiaglog open={openDialog} handleClose={handleCloseDialog}
        initialValues={initialValues} handleFormSubmit={handleFormSubmit} name={selectedSlot}/>
        <LoadingIndicator isLoading={isLoading}/>
      </Box>
      <Dialog open={open} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent sx={{padding: "2rem !important"}}>
          <DialogContentText>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{padding: "1rem"}}>
          <Button onClick={handleCloseConfirm} sx={{backgroundColor: "#dfe3e6", color: "#000"}} variant="contained">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="primary" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const AssignMemberDiaglog = ({open, handleClose, initialValues, handleFormSubmit, name}) => {

  const [users, setUsers] = useState([]);

  const parseDate = (dateString) => {
    const parsedDate = dayjs(dateString, 'DD/MM/YYYY');
    return formatDate(parsedDate.format());
  };

  const getData = () => {
    apiClient.get("/api/Users/GetAllWithDetailsActive").then((data) => {
      const transformedData = data.map(item => ({
        id: item.id,
        name: `${item.firstname} ${item.lastname}`
      }));
      setUsers(transformedData);
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }
  
  useEffect(() => {
    getData();
  },[]);

  const validationSchema = Yup.object().shape({
      memberName: Yup.string().required('Name is required'),
      startDate: Yup.string().required('Start Date is required'),
      endDate: Yup.string().required('End Date is required')
    });
  
    return (
      <Dialog open={open} onClose={handleClose} PaperProps={{sx: {maxWidth: 800}}}>
        <DialogTitle>Add Memebers for {name}</DialogTitle>
        <DialogContent sx={{padding: "2rem !important"}}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ setFieldValue, values, errors }) => {
              return (
                <Form>
                  <div className='row'>
                    <div className='form-group'>
                      <Field
                        name="memberName"
                        fullWidth
                        render={({ field, form }) => (
                          <Autocomplete
                            {...field}
                            fullWidth
                            options={users}
                            getOptionLabel={(option) => option.name}
                            onChange={(_, newValue) => {
                              form.setFieldValue('memberName', newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Member Name"
                                fullWidth
                                error={form.touched.memberName && Boolean(form.errors.memberName)}
                                helperText={form.touched.memberName && form.errors.memberName}
                              />
                            )}
                          />
                        )}
                      />
                    </div>
                    <div className='form-group'>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={values.startDate ? dayjs(values.startDate, "DD/MM/YYYY") : null}
                          onChange={(date) => setFieldValue('startDate', parseDate(date))}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </LocalizationProvider>
                    </div>
                    <div className='form-group'>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="End Date"
                          value={values.endDate ? dayjs(values.endDate, "DD/MM/YYYY") : null}
                          onChange={(date) => setFieldValue('endDate', parseDate(date))}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>
                  <div className='row save-btn'>
                    <Button type="submit" color="primary" variant="contained">
                      Save Changes
                    </Button>
                  </div>
                </Form>
            )}}
          </Formik>
        </DialogContent>
      </Dialog>
    );
}

export default Scheduler;
