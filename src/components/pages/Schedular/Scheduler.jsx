import React, { useEffect, useState } from 'react';
import { Typography, Paper, Chip, IconButton, Collapse, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Scheduler = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState({});
  const [availableSlots, setAvailableSlots] = useState({}); // Available slots per time slot
  const [openBatch, setOpenBatch] = useState({
    morning: true,
    guest: true,
    evening: true,
  });

  // Create 1-hour time slots between 6:00 AM and 8:00 PM
  const generateTimeSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour}:00`;
      const endTime = `${hour + 1}:00`;
      slots.push(`${startTime} - ${endTime}`);
    }
    return slots;
  };

  const morningSlots = generateTimeSlots(6, 11); // Morning batch from 6:00 AM to 11:00 AM
  const guestSlot = ["11:00 AM - 2:00 PM"]; // Merged Guest batch slot
  const eveningSlots = generateTimeSlots(14, 20); // Evening batch from 2:00 PM to 8:00 PM

  useEffect(() => {
    // Initializing available slots for each time slot (max 10)
    const initialAvailableSlots = {};
    [...morningSlots, ...guestSlot, ...eveningSlots].forEach(slot => {
      initialAvailableSlots[slot] = 10; // All slots have 10 available slots initially
    });
    setAvailableSlots(initialAvailableSlots);

    // Initializing assigned members (some pre-assigned data)
    setAssignedMembers({
      '9:00 - 10:00': [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }],
      '10:00 - 11:00': [{ id: 3, name: 'Alice Johnson' }],
      '11:00 - 12:00': [{ id: 4, name: 'Bob Lee' }],
    });
  }, []);

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

  const handleRemoveMember = (slot, memberId) => {
    setAssignedMembers((prevAssignedMembers) => {
      const updatedMembers = {
        ...prevAssignedMembers,
        [slot]: prevAssignedMembers[slot]?.filter((member) => member.id !== memberId),
      };
      return updatedMembers;
    });

    setAvailableSlots((prevAvailableSlots) => {
      const updatedAvailableSlots = { ...prevAvailableSlots, [slot]: prevAvailableSlots[slot] + 1 };
      return updatedAvailableSlots;
    });
  };

  const handleToggleBatch = (batch) => {
    setOpenBatch((prev) => ({
      ...prev,
      [batch]: !prev[batch],
    }));
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom sx={{textAlign: "center", borderBottom: "1px solid lightgray", paddingBottom: "1rem", marginBottom: "2rem", fontWeight: "bold"}}>
        Scheduler
      </Typography>

      {/* Morning Batch Header */}
      <Box display="flex" justifyContent="space-between" 
        alignItems="center" width={"100%"} bgcolor={'#dae4ed'} px={2}
        sx={{cursor: "pointer", borderRadius: "5px"}} onClick={() => handleToggleBatch('morning')} mb={2}>
        <Typography
          variant="h6">
          Morning Batch (6:00 AM - 11:00 AM)
        </Typography>
        <IconButton onClick={() => handleToggleBatch('morning')}>
          {openBatch.morning ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={openBatch.morning}>
        <Box display="flex" flexWrap="wrap" gap={2} p={2}>
          {morningSlots.map((slot, index) => (
            <Box key={index} width="30%" mb={2}>
              <Paper
                elevation={3}
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5',
                  color: '#000',
                  position: 'relative',
                }}
                onClick={() => setSelectedSlot(slot)}
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
                    handleAssignMember(slot);
                  }}
                  disabled={assignedMembers[slot]?.length >= 10}
                >
                  <AddIcon />
                </IconButton>

                <Typography variant="body1">{slot}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px' }}>
                  Available Slots: {availableSlots[slot]}
                </Typography>

                {assignedMembers[slot] && assignedMembers[slot].length > 0 && (
                  <div style={{ marginTop: '10px', textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                    {assignedMembers[slot].map((member) => (
                      <Chip
                        key={member.id}
                        label={member.name}
                        onDelete={() => handleRemoveMember(slot, member.id)}
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
      <Box display="flex" justifyContent="space-between" alignItems="center" width={"100%"} bgcolor={'#dae4ed'} px={2}
        sx={{cursor: "pointer", borderRadius: "5px"}} onClick={() => handleToggleBatch('guest')} mb={2}>
        <Typography
          variant="h6">
          Guest Batch (11:00 AM - 2:00 PM)
        </Typography>
        <IconButton onClick={() => handleToggleBatch('guest')}>
          {openBatch.guest ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={openBatch.guest}>
        <Box display="flex" flexWrap="wrap" gap={2} p={2}>
          {guestSlot.map((slot, index) => (
            <Box key={index} width="30%" mb={2}>
              <Paper
                elevation={3}
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5',
                  color: '#000',
                  position: 'relative',
                }}
                onClick={() => setSelectedSlot(slot)}
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
                    handleAssignMember(slot);
                  }}
                  disabled={assignedMembers[slot]?.length >= 10}
                >
                  <AddIcon />
                </IconButton>

                <Typography variant="body1">{slot}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px' }}>
                  Available Slots: {availableSlots[slot]}
                </Typography>

                {assignedMembers[slot] && assignedMembers[slot].length > 0 && (
                  <div style={{ marginTop: '10px', textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                    {assignedMembers[slot].map((member) => (
                      <Chip
                        key={member.id}
                        label={member.name}
                        onDelete={() => handleRemoveMember(slot, member.id)}
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
      <Box display="flex" justifyContent="space-between" alignItems="center" width={"100%"} bgcolor={'#dae4ed'} px={2}
        sx={{cursor: "pointer", borderRadius: "5px"}} onClick={() => handleToggleBatch('evening')} mb={2}>
        <Typography
          variant="h6">
          Evening Batch (2:00 PM - 8:00 PM)
        </Typography>
        <IconButton onClick={() => handleToggleBatch('evening')}>
          {openBatch.evening ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={openBatch.evening}>
        <Box display="flex" flexWrap="wrap" gap={2} p={2}>
          {eveningSlots.map((slot, index) => (
            <Box key={index} width="30%" mb={2}>
              <Paper
                elevation={3}
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5',
                  color: '#000',
                  position: 'relative',
                }}
                onClick={() => setSelectedSlot(slot)}
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
                    handleAssignMember(slot);
                  }}
                  disabled={assignedMembers[slot]?.length >= 10}
                >
                  <AddIcon />
                </IconButton>

                <Typography variant="body1">{slot}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px' }}>
                  Available Slots: {availableSlots[slot]}
                </Typography>

                {assignedMembers[slot] && assignedMembers[slot].length > 0 && (
                  <div style={{ marginTop: '10px', textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                    {assignedMembers[slot].map((member) => (
                      <Chip
                        key={member.id}
                        label={member.name}
                        onDelete={() => handleRemoveMember(slot, member.id)}
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
    </div>
  );
};

export default Scheduler;