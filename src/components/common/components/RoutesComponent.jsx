import { Route, Routes } from "react-router-dom";
import Home from "../../pages/WebSiteHome/Home";
import Dashboard from "../../pages/Dashboard/Dashboard";
import SmsSettings from "../../pages/AdminConfiguration/SmsSettings";
import Roles from "../../pages/AdminConfiguration/Roles";
import Settings from "../../pages/AdminConfiguration/Settings";
import GuestScreen from '../../pages/Guest/GuestScreen';
import ReportGenerator from '../../pages/Reports/ReportGenerator';
import Packages from '../../pages/Packages/Packages';
import Scheduler from '../../pages/Scheduler/Scheduler';
import Login from "../authentication/login/Login";
import PrivateRoute from "../authentication/PrivateRoute";
import Members from "../../pages/Members/Members";
import MemberDashboard from "../../pages/Dashboard/MemberDashboard";
import ChangePassword from "./ChangePassword";
import Attendance from "../../pages/AdminConfiguration/Attendance";

const RoutesComponent = () => {
    return(
        <Routes>
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard /> } /> }/>
            <Route path="/admin/smssettings" element={<PrivateRoute element={<SmsSettings />} />}/>
            <Route path="/admin/settings" element={<PrivateRoute element={<Settings />} /> }/>
            <Route path="/admin/roles" element={<PrivateRoute element={<Roles />} /> }/>
            <Route path="/admin/attendance" element={<PrivateRoute element={<Attendance />} /> }/>
            <Route path="/members" element={<PrivateRoute element={<Members />} /> }/>
            <Route path="/guest" element={<PrivateRoute element={<GuestScreen />} /> }/>
            <Route path="/reports" element={<PrivateRoute element={<ReportGenerator />} /> }/>
            <Route path="/packages" element={<PrivateRoute element={<Packages/> } /> }/>
            <Route path="/scheduler" element={<PrivateRoute element={<Scheduler />} /> }/>
            <Route path="/member/dashboard" element={<PrivateRoute element={<MemberDashboard />} /> }/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/changepassword" element={<ChangePassword/>}/>
            <Route path="/" element={<Home/>}/>
        </Routes>
    );
}

export default RoutesComponent;