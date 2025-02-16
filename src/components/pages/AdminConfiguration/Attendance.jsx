import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClientService';
import LoadingIndicator from '../../common/components/LoadingIndicator';

const Attendance = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
    
        if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("File size should not exceed 5MB");
            return;
          }
    
          setSelectedFile(file);          
          setError("");          
        }
    };

    const handleUpload = () => {        
        if (!selectedFile) {
            setError("Please select a file first.");
            return;
        }
        setIsLoading(true);
        const config = {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        const formData = new FormData();
        formData.append("csvData", selectedFile);
        apiClient.post("/api/HardwareAttendance/Upload", formData, config).then(() =>{         
            setIsLoading(false);   
            toast.success("File Uploaded Successfully !", {
                position: "top-right"
            });
            }).catch((error) =>{
            setIsLoading(false);
            toast.error("Error while upload " + error, {
                position: "top-right"
            });
        });
    };


    return (
        <div className="container">
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
                <Typography variant='h5' className='header-text'>Attendance         
                </Typography>
                </Box>
                <Card sx={{marginBottom: "10px"}}>
                    <CardContent>
                        <Typography variant='h6' alignItems={"center"}>Upload a File</Typography>

                        <input type="file" onChange={handleFileChange} accept=".csv" />

                        {error && <p style={{color: "red"}}>{error}</p>}                        

                        <Button variant="contained" sx={{marginLeft: "auto"}} onClick={handleUpload}>Upload</Button>                    
                    </CardContent>
                </Card>
            </Box>
            <LoadingIndicator isLoading={isLoading} />
        </div>
    );    
}

export default Attendance;