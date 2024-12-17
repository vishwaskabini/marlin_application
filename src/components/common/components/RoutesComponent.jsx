import { Route, Routes } from "react-router-dom";
import Dashboard from "../../pages/Dashboard/Dashboard";
import SmsSettings from "../../pages/AdminConfiguration/SmsSettings";
import Roles from "../../pages/AdminConfiguration/Roles";
import Settings from "../../pages/AdminConfiguration/Settings";
import GuestScreen from '../../pages/Guest/GuestScreen';
import ReportGenerator from '../../pages/Reports/ReportGenerator';
import PaymentReportGenerator from '../../pages/Reports/PaymentReportGenerator';
import Packages from '../../pages/Packages/Packages';
import Scheduler from '../../pages/Schedular/Scheduler';
import UserProfileScreen from '../../pages/UserProfile/userProfile';
import UserProfiledashbord from '../../pages/UserProfile/userProfiledashbord';
import Login from "../authentication/login/Login";
import PrivateRoute from "../authentication/PrivateRoute";
import Members from "../../pages/Members/Members";

const RoutesComponent = () => {
    return(
        <Routes>
            <Route path="/" element={<PrivateRoute element={<Dashboard /> } /> }/>
            <Route path="/admin/smssettings" element={<PrivateRoute element={<SmsSettings />} />}/>
            <Route path="/admin/settings" element={<PrivateRoute element={<Settings />} /> }/>
            <Route path="/admin/roles" element={<PrivateRoute element={<Roles />} /> }/>
            <Route path="/members" element={<PrivateRoute element={<Members />} /> }/>
            <Route path="/guest" element={<PrivateRoute element={<GuestScreen />} /> }/>
            <Route path="/reports/members-guests" element={<PrivateRoute element={<ReportGenerator />} /> }/>
            <Route path="/reports/payments" element={<PrivateRoute element={<PaymentReportGenerator />} /> }/>
            <Route path="/packages" element={<PrivateRoute element={<Packages/> } /> }/>
            <Route path="/scheduler" element={<PrivateRoute element={<Scheduler />} /> }/>
            <Route path="/user/profile" element={<PrivateRoute element={<UserProfileScreen />} /> }/>
            <Route path="/user/dashboard" element={<PrivateRoute element={<UserProfiledashbord />} /> }/>
            <Route path="/login" element={<Login/>}/>
        </Routes>
    );
}

export default RoutesComponent;