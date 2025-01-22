import { Box, Card, CardContent, Typography } from "@mui/material";
import ListTable from "../../common/components/ListTable";
import { useEffect, useState } from "react";

const MemberDashboard = () => {
    const [username, setUsername] = useState('');
    const loggedInUser = 'Mahesha';
    
    
    useEffect(() => {
        setUsername(loggedInUser);
    }, [])


    const packageColumns = [
        { id: 'package', label: 'Package' },
        { id: 'actualStart', label: 'Actual Start Date' },
        { id: 'actualEnd', label: 'Actual End Date' },
        { id: 'amount', label: 'Package Amount' }
    ];
    const paymentColumns = [
        { id: 'package', label: 'Package' },
        { id: 'paymentDate', label: 'Payment Date' },
        { id: 'amountPaid', label: 'Amount Paid' },
        { id: 'paymentMode', label: 'Payment Mode' }
    ];
    const attendanceColumns = [
        { id: 'package', label: 'Package' },
        { id: 'Date', label: 'Date' },
        { id: 'Time', label: 'Timet Paid' }
        
    ];
    return (        
        <Box className="container" sx={{display: "flex", flexDirection: "column"}}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{display: "flex", width: "25%", marginBottom: "1rem"}}>
                    <Typography variant='h5' className='header-text'>Welcome, {username}! Happy Swiming          
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <h3>Package Details</h3>
                    <Card sx={{marginBottom: "10px"}}>
                        <CardContent>
                            {/* <ListTable columns={packageColumns} rows={rowsDataPackage} tableName="Package List"/> */}
                        </CardContent>
                    </Card>
                <h3>Payment Details</h3>
                <Card sx={{marginBottom: "10px"}}>
                    <CardContent>
                        {/* <ListTable columns={paymentColumns} rows={rowsDataPayment} tableName="Payment List"/> */}
                    </CardContent>
                </Card>
                <h3>Attendance Details</h3>
                <Card sx={{marginBottom: "10px"}}>
                    <CardContent>
                        {/* <ListTable columns={attendanceColumns} rows={rowsDataAttendance} tableName="Attendance List"/> */}
                    </CardContent>
                </Card>
            </Box>            
         </Box>
    );
}

export default MemberDashboard;