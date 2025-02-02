import React, { useState, useEffect } from 'react';
import { Button, duration } from '@mui/material';
import ListTable from '../../common/components/ListTable';
import { Box, Card, CardContent, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../../services/apiClientService';

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [paymentReport, setPaymentReport] = useState([]);
  const [memberReport, setMemberReport] = useState([]);
  const [memberDetailReport, setMemberDetailReport] = useState([]);

  const [activeMembers, setActiveMembers] = useState([]);
  const [expiredMembers, setExpiredMembers] = useState([]);
  const [guestDetails, setGuestDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timePeriodOptions = [
    { label: 'All', value: 'all' },
    { label: 'Month', value: 'monthly' },
    { label: 'Last 3 Months', value: 'current_quarter_month' },
    { label: 'Last 6 Months', value: 'last_half_year' },
    { label: 'Last 1 Year', value: 'last_1_year' }
  ];

  const orderOptions = [
    { label: 'Amount High to Low', value: 'amount_high_to_low' },
    { label: 'Amount Low to High', value: 'amount_low_to_low' },
    { label: 'Registration Date Low to High', value: 'reg_date_low_to_high' }
  ];

  const [duration, setDuration] = React.useState('');

  const getReportData = async () => {
    try {
      let requestBody = {
        "fromdate": "2024-01-30T16:16:42.177Z",
        "toDate": "2025-01-30T16:16:42.177Z"
      }
      const [res1, res2, res3] = await Promise.all([
        apiClient.post("/api/Summary/GetPaymentReportsByDateRange", requestBody),
        apiClient.post("/api/Summary/GetMemberReportsByDateRange", requestBody),
        apiClient.post("/api/Summary/GetMemberDetailedReportsByDateRange", requestBody)
      ]);

      setPaymentReport(res1.data);
      setMemberReport(res2.data);
      setMemberDetailReport(res3.data);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/reportsMembers.json'); // Update path here
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setActiveMembers(data.activeMembers);
        setExpiredMembers(data.expiredMembers);
        setGuestDetails(data.guestDetails);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    //fetchData();
    getReportData();
  }, []);

  const generateReport = () => {
    setDisplayDialog(true);
  };

  const columnsPaymentSummary = [
    { id: 'paidAmount', label: 'Total Amount Collected' },
    { id: 'pendingAmount', label: 'Total Amount Pending' },
    { id: 'totalPayableAmount', label: 'Total Business' }
  ];

  const columnsMembersSummary = [
    { id: 'newlyRegistered', label: 'Total newly registered members' },
    { id: 'active', label: 'Total Active Members' },
    { id: 'expired', label: 'Expired Members' }
  ];

  const columnsDetailedReport = [
    { id: 'memberName', label: 'Member Name' },
    { id: 'contact', label: 'Contact' },
    { id: 'packageName', label: 'Package Name' },
    { id: 'totalPayableAmount', label: 'Total' },
    { id: 'paidAmount', label: 'Paid' },
    { id: 'pendingAmount', label: 'Pending' },
    { id: 'paymentStatus', label: 'Payment Status' },
    { id: 'memberStatus', label: 'Member status' }
  ];
const [rowsData, setRowsData] = useState([]);
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text('Report', 14, 16);

    autoTable(doc, {
      head: [['Name', 'Contact', 'Package', 'Amount Paid', 'Amount Remaining', 'Duration']],
      body: activeMembers.map(member => [member.name, member.contact, member.package, member.amountPaid, member.amountRemaining, member.duration]),
      startY: 30,
    });

    autoTable(doc, {
      head: [['Name', 'Contact', 'Package', 'Amount Paid', 'Amount Remaining', 'Duration']],
      body: expiredMembers.map(member => [member.name, member.contact, member.package, member.amountPaid, member.amountRemaining, member.duration]),
      startY: doc.autoTable.previous.finalY + 10,
    });

    autoTable(doc, {
      head: [['Name', 'Contact', 'Package', 'Amount Paid', 'Amount Remaining', 'Duration']],
      body: guestDetails.map(guest => [guest.name, guest.contact, guest.package, guest.amountPaid, guest.amountRemaining, guest.duration]),
      startY: doc.autoTable.previous.finalY + 10,
    });

    doc.save('report.pdf');
  };

  const exportExcel = () => {
    const membersData = [
      ...activeMembers.map(member => ({
        Name: member.name,
        Contact: member.contact,
        Package: member.package,
        AmountPaid: member.amountPaid,
        AmountRemaining: member.amountRemaining,
        Duration: member.duration,
      })),
      ...expiredMembers.map(member => ({
        Name: member.name,
        Contact: member.contact,
        Package: member.package,
        AmountPaid: member.amountPaid,
        AmountRemaining: member.amountRemaining,
        Duration: member.duration,
      })),
      ...guestDetails.map(guest => ({
        Name: guest.name,
        Contact: guest.contact,
        Package: guest.package,
        AmountPaid: guest.amountPaid,
        AmountRemaining: guest.amountRemaining,
        Duration: guest.duration,
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(membersData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members and Guests');

    XLSX.writeFile(workbook, 'report.xlsx');
  };

  const handleDateChange = () => {

  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
   <div className="container">
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Typography variant='h5' className='header-text'>Reports            
          </Typography>          
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <div className='row'>
              <div className="form-group">
              <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Duration</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={duration}
                    label="Duration"                      
                  >
                    <MenuItem value={1}>Today</MenuItem>
                    <MenuItem value={2}>Current Week</MenuItem>
                    <MenuItem value={3}>Current Month</MenuItem>
                    <MenuItem value={4}>Current Year</MenuItem>
                    <MenuItem value={5}>Last Year</MenuItem>
                    <MenuItem value={6}>All</MenuItem>
                    <MenuItem value={7}>Custom</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className='form-group'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleDateChange}
                    sx={{width: "100%"}}
                    renderInput={(params) => <TextField {...params}/>}
                  />
                </LocalizationProvider>
              </div>     
              <div className='form-group'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleDateChange}
                    sx={{width: "100%"}}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>   
              <div className="form-group">
                  <Button variant="contained">Generate Report</Button>
              </div>             
            </div>           
            <div className='row'>
              <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
                <Typography variant='h5' className='header-text'>Payments Summary           
                </Typography>
              </Box>
            </div>
            <div className='row'>
              <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
                <ListTable columns={columnsPaymentSummary} rows={paymentReport} tableName="Payment Summary"/>
              </Box>
            </div>                
            <div className='row'>
              <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
                <Typography variant='h5' className='header-text'>Members Summary           
                </Typography>
              </Box>
            </div>
            <div className='row'>
              <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
              <ListTable columns={columnsMembersSummary} rows={memberReport} tableName="Members Summary"/>
              </Box>
            </div>
            <div className='row'>
              <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
                <Typography variant='h5' className='header-text'>Detailed Report - Payment           
                </Typography>
              </Box>
            </div>
            <div className='row'>
              <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
              <ListTable columns={columnsDetailedReport} rows={memberDetailReport} tableName="Detailed Report"/>
              </Box>
            </div>
          </CardContent>
        </Card>
      </Box>  
     </div>
  );
};

export default ReportGenerator;