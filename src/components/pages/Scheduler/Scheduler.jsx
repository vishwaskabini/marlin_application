import React, { useEffect, useState } from 'react';
import { Typography, Paper, Chip, IconButton, Collapse, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid2 as Grid, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

const Scheduler = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [slots, setSlots] = useState({});
  const [openBatch, setOpenBatch] = useState({
    morning: true,
    guest: true,
    evening: true,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getTimeSlots = () => {
    setIsLoading(true);
    apiClient.get("/api/Timeslots").then((data) => {      
      var batchdata = sortAndCategorize(data)      
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
          updateAvailableSlots(timeslotid);
          return acc;
        }, {});
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

  const sortAndCategorize = (timeSlots) => {
    const morning = [];
    const guest = [];
    const evening = [];

    timeSlots.forEach((slot) => {
        const [start, end] = slot.name.split("-");
        const startMinutes = convertToMinutes(start);
                
        if (slot.batch === "Morning" && startMinutes >= convertToMinutes("06:00") && startMinutes < convertToMinutes("12:00")) {
            morning.push(slot);
        } else if (slot.batch === "Public") {
            guest.push(slot);
        } else if (slot.batch === "Evening" && startMinutes >= convertToMinutes("14:00") && startMinutes < convertToMinutes("20:00")) {
            evening.push(slot);
        }
    });
    
    const sortByStartTime = (a, b) => {
        const [startA] = a.name.split("-");
        const [startB] = b.name.split("-");
        const startMinutesA = convertToMinutes(startA);
        const startMinutesB = convertToMinutes(startB);
        return startMinutesA - startMinutesB;
    };

    return {
        morning: morning.sort(sortByStartTime),
        guest: guest.slice(0, 1).map(item => ({
          ...item,
          name: "11:00-14:00"
        })),
        evening: evening.sort(sortByStartTime),
    };
  };

  useEffect(() => {
    getAssignedUsers(convertDate(selectedDate));
  },[selectedDate])

  useEffect(() => {
    getTimeSlots();    
  }, []);

  const initializeAvailableSlots = (slots) => {
    const initialAvailableSlots = {};
    [...slots.morning, ...slots.guest, ...slots.evening].forEach(slot => {
      initialAvailableSlots[slot.id] = 50;
    });
    setAvailableSlots(initialAvailableSlots);
  }

  const updateAvailableSlots = (timeslotid) => {
    setAvailableSlots((prevAvailableSlots) => {
      const updatedAvailableSlots = { ...prevAvailableSlots };
      if (updatedAvailableSlots[timeslotid] !== undefined) {
        updatedAvailableSlots[timeslotid] -= 1;
      } else {
        updatedAvailableSlots[timeslotid] = 50;
      }
      return updatedAvailableSlots;
    });
  }

  const handleAssignMember = (slot) => {
    if (assignedMembers[slot]?.length < 10) {
      const newMemberId = assignedMembers[slot]?.length + 1 || 1;
      const newMember = { id: newMemberId, name: `Member ${newMemberId}` };

      setAssignedMembers((prevAssignedMembers) => {
        const updatedMembers = { ...prevAssignedMembers, [slot]: [...(prevAssignedMembers[slot] || []), newMember] };
        return updatedMembers;
      });

      setAvailableSlots((prevAvailableSlots) => {
        const updatedAvailableSlots = { ...prevAvailableSlots, [slot]: prevAvailableSlots[slot] - 1 };
        return updatedAvailableSlots;
      });
    } else {
      alert('This time slot has reached the maximum number of members (10)');
    }
  };

  const handleRemoveMember = (slot, userScheduleId) => {
    setIsLoading(true);
    apiClient.delete("/api/UsersScheduleMapping/"+userScheduleId).then(() =>{
      setAssignedMembers((prevAssignedMembers) => {
        const updatedMembers = {
          ...prevAssignedMembers,
          [slot]: prevAssignedMembers[slot]?.filter((member) => member.id !== userScheduleId),
        };
        return updatedMembers;
      });
  
      setAvailableSlots((prevAvailableSlots) => {
        const updatedAvailableSlots = { ...prevAvailableSlots, [slot]: prevAvailableSlots[slot] + 1 };
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
  };

  const handleToggleBatch = (batch) => {
    setOpenBatch((prev) => ({
      ...prev,
      [batch]: !prev[batch],
    }));
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(dayjs(newDate));
  };

  const handleOpenDialog = (slot) => {
    setSelectedSlot(slot);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormSubmit = (values) => {
    console.log(values);
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
            {/* Morning Batch Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" width={"100%"} bgcolor={'#dae4ed'} px={2} sx={{ cursor: "pointer", borderRadius: "5px" }} onClick={() => handleToggleBatch('morning')} mb={2}>
              <Typography variant="h6">
                Morning Batch (6:00 AM - 11:00 AM)
              </Typography>
              <IconButton onClick={() => handleToggleBatch('morning')}>
                {openBatch.morning ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={openBatch.morning}>
              <Box display="flex" flexWrap="wrap" gap={2} p={2}>
                {slots?.morning?.map((slot, index) => (
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
                      onClick={() => setSelectedSlot(slot.id)}
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
                          handleOpenDialog(slot.id);
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
                          {assignedMembers[slot.id].map((member) => (
                            <Chip
                              key={member.userid}
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
            </Collapse>

            {/* Guest Batch Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" width={"100%"} bgcolor={'#f5f5f5'} px={2} sx={{ cursor: "pointer", borderRadius: "5px" }} onClick={() => handleToggleBatch('guest')} mb={2}>
              <Typography variant="h6">
                Guest Batch (11:00 AM - 2:00 PM)
              </Typography>
              <IconButton onClick={() => handleToggleBatch('guest')}>
                {openBatch.guest ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={openBatch.guest}>
              <Box display="flex" flexWrap="wrap" gap={2} p={2}>
                {slots?.guest?.map((slot, index) => (
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
                      onClick={() => setSelectedSlot(slot.id)}
                    >
                      <IconButton
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          color: '#1976d2',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering onClick of Paper
                          handleOpenDialog(slot.id);
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
                          {assignedMembers[slot.id].map((member) => (
                            <Chip
                              key={member.userid}
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
            </Collapse>

            {/* Evening Batch Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" width={"100%"} bgcolor={'#e6f2ff'} px={2} sx={{ cursor: "pointer", borderRadius: "5px" }} onClick={() => handleToggleBatch('evening')} mb={2}>
              <Typography variant="h6">
                Evening Batch (2:00 PM - 8:00 PM)
              </Typography>
              <IconButton onClick={() => handleToggleBatch('evening')}>
                {openBatch.evening ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={openBatch.evening}>
              <Box display="flex" flexWrap="wrap" gap={2} p={2} width={"100%"} justifyContent={'space-between'}>
                {slots?.evening?.map((slot, index) => (
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
                      onClick={() => setSelectedSlot(slot.id)}
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
                          handleOpenDialog(slot.id);
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
                          {assignedMembers[slot.id].map((member) => (
                            <Chip
                              key={member.userid}
                              label={member.name}
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
            </Collapse>
          </CardContent>
        </Card>
        <AssignMemberDiaglog open={openDialog} handleClose={handleCloseDialog}
        initialValues={initialValues} handleFormSubmit={handleFormSubmit} name={selectedSlot}/>
        <LoadingIndicator isLoading={isLoading}/>
      </Box>
    </div>
  );
};

const AssignMemberDiaglog = ({open, handleClose, initialValues, handleFormSubmit, name}) => {
  const validationSchema = Yup.object().shape({
      memberName: Yup.string().required('Name is required'),
      startDate: Yup.date().required('Start Date is required'),
      endDate: Yup.date().required('End Date is required')
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
            {({ setFieldValue, values }) => (
              <Form>
                <div className='row'>
                  <div className='form-group'>
                    <Field
                      name="memberName"
                      render={({ field, form }) => (
                        <TextField
                          {...field}
                          label="Member Name"
                          fullWidth
                          error={form.touched.memberName && Boolean(form.errors.memberName)}
                          helperText={form.touched.memberName && form.errors.memberName}
                        />
                      )}
                    />
                  </div>
                  <div className='form-group'>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={values.startDate}
                        onChange={(date) => setFieldValue('startDate', date)}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </div>
                  <div className='form-group'>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="End Date"
                        value={values.endDate}
                        onChange={(date) => setFieldValue('endDate', date)}
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
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    );
}

export default Scheduler;
