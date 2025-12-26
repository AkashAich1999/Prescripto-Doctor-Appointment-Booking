import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext"
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // const slotDateFormat = (slotDate) => {
  //   const dateArray = slotDate.split("_");
  //   return dateArray[0] + " " + months[Number(dateArray[1])-1] + " " + dateArray[2];
  // } 

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split("_");
    return `${day} ${months[Number(month) - 1]} ${year}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="font-medium text-zinc-700 mt-12 pb-3 border-b">My appointments</p>
      <div>
        {
          appointments.map((item, index) => (
            <div className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b" key={index}>
              <div>
                <img className="w-32 bg-indigo-50" src={item.docData.image} alt="" />
              </div>
              <div className="text-sm text-zinc-600 flex-1">
                <p className="text-neutral-800 font-semibold">{item.docData.name}</p>
                <p>{item.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item.docData.address.line1}</p>
                <p className="text-xs">{item.docData.address.line2}</p>
                <p className="text-xs mt-1"><span className="text-sm text-neutral-700 font-medium">Date & Time: </span>{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                <button className="text-stone-500 text-sm text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">Pay Online</button>
                <button className="text-stone-500 text-sm text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">Cancel Appointment</button>
              </div>
            </div>
          ))
        }    
      </div>
    </div>
  )
}

export default MyAppointments;