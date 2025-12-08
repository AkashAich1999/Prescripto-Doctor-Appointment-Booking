import { createContext } from "react";
import { doctors } from "../assets/assets"

export const AppContext = createContext();  // createContext() returns an object that can be shared across the entire app.

const AppContextProvider = (props) => {
    const value = {
        doctors
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;