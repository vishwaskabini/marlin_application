import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import ListTable from '../../common/components/ListTable';
import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../../services/apiClientService';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentReport, setPaymentReport] = useState([]);
  const [memberReport, setMemberReport] = useState([]);
  const [memberDetailReport, setMemberDetailReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = React.useState('1');

  const getReportData = async (requestBody) => {
    setLoading(true);
    try {
      const [res1, res2, res3] = await Promise.all([
        apiClient.post("/api/Summary/GetPaymentReportsByDateRange", requestBody),
        apiClient.post("/api/Summary/GetMemberReportsByDateRange", requestBody),
        apiClient.post("/api/Summary/GetMemberDetailedReportsByDateRange", requestBody)
      ]);

      setPaymentReport([res1]);
      setMemberReport([res2]);
      setMemberDetailReport(res3);

      setLoading(false);
    } catch (err) {
      toast.error("Error while getting report data" + err, {
        position: "top-right"
      });
      setLoading(false);
    }
  }

  useEffect(() => {
    let dateRangeRequest = getDateRange("1");
    getReportData(dateRangeRequest);
  }, []);

  const generateReport = () => {
    let dateRangeRequest = getDateRange(duration);
    getReportData(dateRangeRequest);
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
      head: [['Total Amount Collected', 'Total Amount Pending', 'Total Business']],
      body: paymentReport.map(payment => [payment.paidAmount, payment.pendingAmount, payment.totalPayableAmount]),
      startY: 30,
    });

    autoTable(doc, {
      head: [['Total newly registered members', 'Total Active Members', 'Expired Members']],
      body: memberReport.map(member => [member.newlyRegistered, member.active, member.expired]),
      startY: doc.autoTable.previous.finalY + 10,
    });

    autoTable(doc, {
      head: [['Member Name', 'Contact', 'Package Name', 'Total', 'Paid', 'Pending', 'Payment Status', 'Member status']],
      body: memberDetailReport.map(member => [member.memberName, member.contact, member.packageName, member.totalPayableAmount, member.paidAmount, member.pendingAmount, member.paymentStatus, member.memberStatus]),
      startY: doc.autoTable.previous.finalY + 10,
    });

    doc.save('report.pdf');
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(paymentReport);    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PaymentSummary');

    const worksheet1 = XLSX.utils.json_to_sheet(memberReport);    
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'MembersSummary');

    const worksheet2 = XLSX.utils.json_to_sheet(memberDetailReport);    
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'MembersDetails');

    XLSX.writeFile(workbook, 'report.xlsx');
  };

  const handleDateChange = (event) => {
    setDuration(event.target.value);    
  }

  const getDateRange = (value) => {
    const today = dayjs().startOf("day"); // Start of today
    let fromDate, toDate;
  
    switch (value) {
      case 1: // Today
        fromDate = today;
        toDate = today.endOf("day");
        break;
        
      case 2: // Current Week
        fromDate = today.startOf("week"); 
        toDate = today.endOf("week");
        break;
  
      case 3: // Current Month
        fromDate = today.startOf("month"); 
        toDate = today.endOf("month");
        break;
  
      case 4: // Current Year
        fromDate = today.startOf("year"); 
        toDate = today.endOf("year");
        break;
  
      case 5: // Last Year
        fromDate = today.subtract(1, "year").startOf("year");
        toDate = today.subtract(1, "year").endOf("year");
        break;

      case 6: // Custom
        fromDate = startDate;
        toDate = endDate;
        break;
  
      default:
        fromDate = today;
        toDate = today;
    }
  
    return {
      fromDate: dayjs(fromDate).tz("Asia/Kolkata").format("YYYY-MM-DD"),
      toDate: dayjs(toDate).tz("Asia/Kolkata").format("YYYY-MM-DD"),
    };
  };

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
                  onChange={handleDateChange}
                >
                  <MenuItem value={1}>Today</MenuItem>
                  <MenuItem value={2}>Current Week</MenuItem>
                  <MenuItem value={3}>Current Month</MenuItem>
                  <MenuItem value={4}>Current Year</MenuItem>
                  <MenuItem value={5}>Last Year</MenuItem>
                  <MenuItem value={6}>Custom</MenuItem>
                </Select>
              </FormControl>
            </div>
            {duration == "6" && 
              <>
                <div className='form-group'>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(e) => setStartDate(e)}
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
                      onChange={(e) => setEndDate(e)}
                      sx={{width: "100%"}}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </div>
              </>
            }
            <div className="form-group">
                <Button variant="contained" onClick={generateReport}>Generate Report</Button>
            </div>
            <Box sx={{display: "flex", minWidth: "400px", justifyContent: "flex-end"}}>
              <div className="form-group">
                  <Button variant="contained" onClick={exportExcel}>Export to Excel</Button>
              </div>
              <div className="form-group">
                  <Button variant="contained" onClick={exportPdf}>Export to PDF</Button>
              </div>
            </Box>
          </div>           
          <div className='row'>
            <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
              <Typography variant='h5' className='header-text'>Payments Summary           
              </Typography>
            </Box>
          </div>
          <div className='row'>
            <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
              <ListTable columns={columnsPaymentSummary} rows={paymentReport} tableName="Payment Summary" showSearch={false}/>
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
            <ListTable columns={columnsMembersSummary} rows={memberReport} tableName="Members Summary" showSearch={false}/>
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
            <ListTable columns={columnsDetailedReport} rows={memberDetailReport} tableName="Detailed Report" showSearch={false}/>
            </Box>
          </div>
        </CardContent>
      </Card>
    </Box>
    <LoadingIndicator isLoading={loading}/>
   </div>
  );
};

export default ReportGenerator;