import { createContext, useEffect, useState } from "react";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

    // Sync token with localStorage
    useEffect(() => {
        if (token) { // When token exists. (Admin logged in) 
            localStorage.setItem("adminToken", token);
        } else {    // When token does NOT exist. (Admin logged out)
            localStorage.removeItem("adminToken");
        }
    }, [token]);

    const value = {
        token, 
        setToken,
        backendUrl
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
}

export default AdminContextProvider;

{/*
    Initializing token from localStorage :

    const [token, setToken] = useState(
        localStorage.getItem("adminToken") || ""
    );    

    This solves a very important problem :

    • Page refresh should NOT log admin out.
    • Context state resets on refresh
    • localStorage persists across reloads

    1. Admin stays logged in after refresh.
    2. Protected routes keep working.

    This part is very important for understanding how login persistence works in React.
*/}

{/*
    1. Initial State :

    const [token, setToken] = useState(
        localStorage.getItem("adminToken") || ""
    );
    
    Step-by-Step :
    1. localStorage.getItem("adminToken")
        • Tries to fetch the token saved earlier.
        • Returns :
            • a string JWT → if admin already logged in before
            • null → if no token exists
    2. || ""
        • If localStorage.getItem(...) is null,
        • fallback to an empty string.

    Result:
    Situation	                token value   
    Admin logged in earlier     JWT string
    Fresh visit / logged out    ""

    This is what keeps the admin logged in even after page refresh.
*/}

{/*
    2. Sync Logic :

    useEffect(() => {
        if (token) {
            localStorage.setItem("adminToken", token);
        } else {
            localStorage.removeItem("adminToken");
        }
    }, [token]);

    Runs every time token changes. Because token is in the dependency array [token].
*/}

{/*
    Case 1: Admin Logs In.
    
    setToken(data.token);

    Then:   
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    Now, useEffect runs:
        if (token) {
            localStorage.setItem("adminToken", token);
        }

    Result:
    • Token is saved to localStorage.
    • Admin stays logged in even after refresh.    
*/}

{/*
    Why we need BOTH parts :
    1. Without reading from localStorage
    Refresh page → token lost → admin logged out

    2. Without syncing back to localStorage
    Login works, but token is not persisted

    
    With both together:
    Login persists
    Logout clears everything
    State & storage stay in sync    
*/}