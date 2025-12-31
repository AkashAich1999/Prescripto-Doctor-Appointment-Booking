import { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext.jsx";

const Login = () => {
    const [state, setState] = useState("Admin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setToken, backendUrl } = useContext(AdminContext);

    const { setDToken } = useContext(DoctorContext);

    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            if (state === "Admin") {
                const { data } = await axios.post(`${backendUrl}/api/admin/login`,
                    { email, password } // send credentials 
                );

                if (data.success) {
                    console.log(data.token);
                    // save token
                    setToken(data.token);   // Context handles localStorage

                    // localStorage.setItem("adminToken", data.token);

                    toast.success("Login successful");

                    navigate("/");
                }
            } else {
                const {data} = await axios.post(
                    `${backendUrl}/api/doctor/login`, 
                    { email, password },    // send credentials 
                );

                if (data.success) {
                    console.log(data.token);
                    // save token
                    setDToken(data.token);  // Context handles localStorage
                    // localStorage.setItem("doctorToken", data.token);
                    
                    toast.success("Login Successful");
                    navigate("/", { replace: true });
                }

            }   

        } catch (error) {
            // Backend responded with error
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {  //  Network / unknown error
                toast.error("Something went wrong");
            }
        }
    }


  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
        <div className="flex flex-col gap-4 m-auto items-start p-8 text-sm text-[#5E5E5E] min-w-[340px] sm:min-w-96 border rounded-xl shadow-lg">
            <p className="text-2xl font-semibold m-auto"> <span className="text-primary">{state}</span> Login </p>
            <div className="w-full">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} className="border border-[#DADADA] rounded w-full p-2 mt-1" type="email" required />
            </div>
            <div className="w-full">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} className="border border-[#DADADA] rounded w-full p-2 mt-1" type="password" required />
            </div>
            <button className="bg-primary text-white w-full py-2 text-base rounded-md">Login</button>
            {
                state === "Admin"
                ? <p>Doctor Login? <span onClick={() => setState("Doctor")} className="text-primary underline cursor-pointer">Click here</span> </p>
                : <p>Admin Login? <span onClick={() => setState("Admin")} className="text-primary underline cursor-pointer">Click here</span> </p>
            }
        </div>
    </form>
  )
}

export default Login;

{/*

    error = {
        response: {
            status: 401,
            data: {
            success: false,
            message: "Invalid credentials"
            }
        }
    }   

*/}