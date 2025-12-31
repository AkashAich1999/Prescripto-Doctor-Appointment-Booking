import { createContext, useEffect, useState } from "react";

export const DoctorContext = createContext();

const DocterContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dtoken, setDToken] = useState(localStorage.getItem("doctorToken") || "");

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
        dtoken, setDToken
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DocterContextProvider;