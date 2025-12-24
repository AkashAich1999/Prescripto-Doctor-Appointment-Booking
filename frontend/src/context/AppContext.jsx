import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext(); // createContext() returns an object that can be shared across the entire app.

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("userToken") || "");
  const [userData, setUserData] = useState(null);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      // When token exists. (User logged in)
      localStorage.setItem("userToken", token);
    } else {
      // When token does NOT exist. (User logged out)
      localStorage.removeItem("userToken");
    }
  }, [token]);

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(null);
    }
  }, [token]);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load Doctors");
      console.log(error);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/get-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("TOKEN:", token);
      console.log("AUTH HEADER:", `Bearer ${token}`);

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Failed to load profile");
      }
    } catch (error) {
      toast.error("Failed to load User Profile");
      console.log(error);
    }
  };

  const value = {
    doctors,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;