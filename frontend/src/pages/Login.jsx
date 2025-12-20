import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { token, setToken, backendUrl } = useContext(AppContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/"); // or /my-profile
    }
  }, [token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      let data;

      if (state === "Sign Up") {
        const response = await axios.post(
          `${backendUrl}/api/user/register`,
          { name, email, password } // send credentials
        );

        data = response.data;
      } else {
        const response = await axios.post(
          `${backendUrl}/api/user/login`,
          { email, password } // send credentials
        );

        data = response.data;
      }

      if (data.success) {
        setToken(data.token); // AppContext handles localStorage.
        console.log("Token from backend:", data.token);
        toast.success(
          state === "Sign Up"
            ? "Account created successfully"
            : "Login successful"
        );
        navigate("/"); // or "/my-profile"
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex items-center min-h-[80vh]">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 text-sm text-zinc-600 border shadow-lg rounded-xl">
        <p className="text-2xl font-semibold text-primary">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "sign up" : "log in"} to book
          appointment
        </p>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="border border-zinc-400 rounded w-full mt-1 p-2"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-400 rounded w-full mt-1 p-2"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-400 rounded w-full mt-1 p-2"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base mt-1"
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-primary underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
