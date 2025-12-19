import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();  // createContext() returns an object that can be shared across the entire app.

const AppContextProvider = (props) => {
    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        getDoctorsData();
    }, []);

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/list`);

            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error("Failed to load doctors");
            console.log(error);
        }
    }

    const value = {
        doctors, currencySymbol, 
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;