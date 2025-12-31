import { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import NotFound from "./pages/NotFound";
import { DoctorContext } from "./context/DoctorContext";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

const App = () => {
  const { token } = useContext(AdminContext);
  const { dtoken } = useContext(DoctorContext);

  return token || dtoken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          {/* Admin Route */}
          <Route path="/" element={<></>} />
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/all-appointments" element={<AllAppointments />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/doctor-list" element={<DoctorsList />} />

          {/* Doctor Route */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  ) : (
    <div>
      <Login />
      <ToastContainer />
    </div>
  )
}

export default App;

{/*
    items-start is a Tailwind CSS utility class that sets align-items: flex-start.
    Aligns flex/grid items to the START of the cross-axis.  
*/}