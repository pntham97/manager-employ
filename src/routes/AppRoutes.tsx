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
<<<<<<< HEAD
import ScheduleApproval from "../pages/ScheduleApproval";
=======
import AddEmploys from "../pages/AddEmploys";
>>>>>>> c73ae098a66be0db28a52ed51c63cd93327a3a84

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* AUTH ROUTES (NO SIDEBAR) */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />

                </Route>
                {/* PRIVATE ROUTES */}
                {/* <Route element={<PrivateRoute />}> */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/Wage" element={<Wage />} />
                    <Route path="/Projects" element={<Projects />} />.
                    <Route path="/Calendar" element={<Calendar />} />
                    <Route path="/ScheduleApproval" element={<ScheduleApproval />} />
                    <Route path="/ManagerEmploy" element={<ManagerEmploy />} />
                    <Route path="/ManagerEmploy/AddEmploys" element={<AddEmploys />} />
                    <Route path="/EmployDetail" element={<EmployDetail />} />
                </Route>
                {/* </Route> */}
            </Routes>
        </Router>
    );
};

export default AppRoutes;
