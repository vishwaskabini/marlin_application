import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import ListTable from "../../common/components/ListTable";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClientService";
import { toast } from "react-toastify";
import LoadingIndicator from "../../common/components/LoadingIndicator";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const MemberDashboard = () => {
  const [packageDetails, setPackageDetails] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [packageTypes, setPackageTypes] = useState([]);
  let selectedMemberId = "";

  const packageColumns = [
    { id: "packageName", label: "Package" },
    { id: "actualstartdate", label: "Actual Start Date" },
    { id: "actualenddate", label: "Actual End Date" },
  ];
  const paymentColumns = [
    { id: "updateddate", label: "Payment Date" },
    { id: "roundedpayment", label: "Amount Paid" },
    { id: "pendingamount", label: "Balance Amount" },
    { id: "paymentstatus", label: "Payment Status" },
  ];
  const attendanceColumns = [
    { id: "scheduledDate", label: "Schedule Date" },
    { id: "scheduledTime", label: "Schedule Time" },
    { id: "hardwareCheckinDate", label: "Hardware Checkin Date" },
    { id: "hardwareCheckinTime", label: "Hardware Checkin Time" },
  ];
  const attendanceSummaryColumns = [
    { id: "totalregisteredclass", label: "Total Registered Classes" },
    { id: "totalactualattendendclass", label: "Total Attended Classes" },
    { id: "totalmissedclass", label: "Total Missed Classes" },
  ];

  const getMemberAttendanceDetails = () => {
    setIsLoading(true);
    apiClient
      .get(
        "/api/HardwareAttendance/GetHardwareAttendance?userId=" +
          selectedMemberId
      )
      .then((data) => {
        setIsLoading(false);
        setAttendanceDetails(data);
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Error while get " + error, {
          position: "top-right",
        });
      });
  };

  const getMemberAttendanceSummary = () => {
    setIsLoading(true);
    apiClient
      .get(
        "/api/AttendanceSummary/GetAttendanceSummary?userId=" + selectedMemberId
      )
      .then((data) => {
        setIsLoading(false);
        setAttendanceSummary([data]);
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Error while get " + error, {
          position: "top-right",
        });
      });
  };

  const getPackages = () => {
    setIsLoading(true);
    apiClient
      .get("/api/Packages")
      .then((data) => {
        setIsLoading(false);
        setPackageTypes(data);
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Error while get " + error, {
          position: "top-right",
        });
      });
  };

  const getPackageName = (packageId) => {
    const packageDetails = packageTypes.find((pkg) => pkg.id === packageId);
    return packageDetails ? packageDetails.name : "";
  };

  const getMemberDetails = () => {
    setIsLoading(true);
    apiClient
      .get("/api/Users/GetAllWithDetailsByUserId?userId=" + selectedMemberId)
      .then((data) => {
        setIsLoading(false);
        if (data[0].packageDetails && data[0].packagepaymentDetails) {
          const formattedDataPackage = data[0].packageDetails.map((item) => ({
            ...item,
            packageName: getPackageName(item.packageid),
            actualstartdate: dayjs(item.updateddate).format("DD/MM/YYYY"),
            actualenddate: dayjs(item.updateddate).format("DD/MM/YYYY"),
          }));
          setPackageDetails(formattedDataPackage);
          const formattedData = data[0].packagepaymentDetails.map((item) => ({
            ...item,
            updateddate: dayjs(item.updateddate).format("DD/MM/YYYY"),
          }));
          setPaymentDetails(formattedData);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Error while get " + error, {
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    selectedMemberId = sessionStorage.getItem("userId");
    if(selectedMemberId) {
      getPackages();
      getMemberAttendanceSummary();
      getMemberDetails();
      getMemberAttendanceDetails();
    }    
  }, []);

  return (
    <div className="">
      <Card sx={{marginBottom: "10px"}}>
        <CardContent>
          <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <Typography variant="h5" className="header-text">
                  Package Details
                </Typography>
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <ListTable
                  columns={packageColumns}
                  rows={packageDetails}
                  tableName="Package Details"
                  showSearch={false}
                />
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <Typography variant="h5" className="header-text">
                  Payment Details
                </Typography>
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <ListTable
                  columns={paymentColumns}
                  rows={paymentDetails}
                  tableName="Payment Details"
                  showSearch={false}
                />
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <Typography variant="h5" className="header-text">
                  Attendance Summary
                </Typography>
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <ListTable
                  columns={attendanceSummaryColumns}
                  rows={attendanceSummary}
                  tableName="Attendance Summary"
                  showSearch={false}
                />
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <Typography variant="h5" className="header-text">
                  Attendance Details
                </Typography>
              </Box>
            </div>
            <div className="row">
              <Box sx={{ display: "flex", width: "100%", marginBottom: "1rem" }}>
                <ListTable
                  columns={attendanceColumns}
                  rows={attendanceDetails}
                  tableName="Attendance Details"
                  showSearch={false}
                />
              </Box>
            </div>
          </CardContent>
        </Card>
        <LoadingIndicator isLoading={isLoading} />
    </div>
  );
};

export default MemberDashboard;
