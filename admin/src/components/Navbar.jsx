import { useContext } from "react";
import { assets } from "../assets/assets.js"
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext.jsx";

const Navbar = () => {
   const { token, setToken } = useContext(AdminContext);
   const { setDToken } = useContext(DoctorContext);
   const navigate = useNavigate();

   const handleLogout = () => {
    setToken("");            // LOGOUT
    setDToken("");
    // navigate("/login", { replace: true });
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
        <div className="flex items-center gap-2 text-xs">
            <img className="w-36 sm:w-40 cursor-pointer" src={assets.admin_logo} alt="" />
            <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">{ token ? "Admin" : "Doctor" }</p>
        </div>
        <button onClick={handleLogout} className="bg-primary text-white text-sm px-10 py-2 rounded-full">Logout</button>
    </div>
  )
}

export default Navbar;

{/* 
    “Logout in a JWT-based app means removing the token from the client. 
    Since JWTs are stateless, clearing the token from localStorage and 
    context automatically logs the user out and prevents access to protected routes.”  
*/}