// routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MainLayout from "../layouts/MainLayout";
import Wage from "../pages/Wage";
import Projects from "../pages/Projects";
import Calendar from "../pages/Calendar";
import ManagerEmploy from "../pages/ManagerEmploy";
import EmployDetail from "../pages/EmployDetail";
import ScheduleApproval from "../pages/ScheduleApproval";
import ScheduleManagement from "../pages/ScheduleManagement";
import CreateShiftTypeSupplier from "../pages/CreateShiftTypeSupplier";
import AddEmploys from "../pages/AddEmploys";
import PrivateRoute from "../pages/PrivateRoute";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* AUTH ROUTES (NO SIDEBAR) */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />

                </Route>
                {/* PRIVATE ROUTES */}
                <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/wage" element={<Wage />} />
                        <Route path="/projects" element={<Projects />} />.
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/schedule-approval" element={<ScheduleApproval />} />
                        <Route path="/schedule-management" element={<ScheduleManagement />} />
                        <Route path="/schedule-management/create-shift-type-supplier" element={<CreateShiftTypeSupplier />} />
                        <Route path="/manager-employ" element={<ManagerEmploy />} />
                        <Route path="/manager-employ/add-employs" element={<AddEmploys />} />
                        <Route path="/employ-detail" element={<EmployDetail />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
