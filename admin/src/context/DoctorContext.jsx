import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DocterContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dtoken, setDToken] = useState(localStorage.getItem("doctorToken") || "");
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);
 
    const getAppointments = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
          headers: {
            Authorization: `Bearer ${dtoken}`,
          },
        });

        if (data.success) {
          setAppointments([...data.appointments].reverse());
          console.log(data.appointments);
        } else {
          toast.error(data.message);
        }

      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to Load Appointments"
        );
      }
    };

    const completeAppointment = async (appointmentId) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/doctor/complete-appointment`,
          { appointmentId },
          {
            headers: {
              Authorization: `Bearer ${dtoken}`,
            },
          }
        );

        if (data.success) {
          toast.success(data.message);
          getAppointments();
          getDashData();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to Mark Completed"
        );
      }
    };

    const cancelAppointment = async (appointmentId) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/doctor/cancel-appointment`,
          { appointmentId },
          {
            headers: {
              Authorization: `Bearer ${dtoken}`,
            },
          }
        );

        if (data.success) {
          toast.success(data.message);
          getAppointments();
          getDashData();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to Cancel Appointment"
        );
      }
    };

    const getDashData = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
          headers: {
            Authorization: `Bearer ${dtoken}`,
          },
        });

        if (data.success) {
          setDashData(data.dashData);
          console.log(data.dashData);
        } else {
          toast.error(data.message);
        }

      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to Load Dashboard Data"
        );
      }
    };

    const getProfileData = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${dtoken}`,
          }
        });

        if (data.success) {
          setProfileData(data.profileData);
        } else {
          toast.error(data.message);
        }

      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to Get Profile Data"
        );
      }
    }

    // Sync token with localStorage
      useEffect(() => {
        if (dtoken) {
          // When token exists. (Doctor logged in)
          localStorage.setItem("doctorToken", dtoken);
        } else {
          // When token does NOT exist. (Doctor logged out)
          localStorage.removeItem("doctorToken");
        }
      }, [dtoken]);

    const value = {
        backendUrl,
        dtoken, setDToken,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData, setDashData,
        getDashData, 
        profileData, setProfileData,
        getProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DocterContextProvider;