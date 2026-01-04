import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext"
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const navigate = useNavigate();

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

  const cancelAppointment = async (appointmentId) => {
    try {
      // console.log(appointmentId);
      const {data} = await axios.post(`${backendUrl}/api/user/cancel-appointment`, 
        {appointmentId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to Cancel Appointment"
      );
    }
  }

  const initPay = (order) => {
    // 1. Razorpay Checkout Options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      // 2. Payment Success Handler
      handler: async (response) => {
        console.log(response);

        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verifyRazorpay`,
            response,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            },
          );

          if (data.success) {
            toast.success("Payment Successful");
            getUserAppointments();
            navigate("/my-appointments");
          } else {
            toast.error(data.message);
          }

        } catch (error) {
          console.error(error);
          toast.error(
            error.response?.data?.message || "Payment Verification Failed"
          );
        }
      }
    }

    // 3. Open Razorpay Popup
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        console.log("Razorpay Order:", data.order);
        // next step: open Razorpay checkout
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Payment Initiation Failed");
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="font-medium text-zinc-700 mt-12 pb-3 border-b">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="text-sm text-zinc-600 flex-1">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:{" "}
                </span>
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button
                  disabled
                  className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50 cursor-not-allowed"
                >
                  Paid
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="text-stone-500 text-sm text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay Online
                </button>
              )}
              <button
                disabled={item.cancelled || item.isCompleted}
                onClick={() => cancelAppointment(item._id)}
                className={`text-sm text-center sm:min-w-48 py-2 border rounded transition-all duration-300
                    ${
                      item.cancelled
                        ? "text-stone-500 bg-gray-100 cursor-not-allowed"
                        : item.isCompleted
                        ? "border-green-500 rounded text-green-500 cursor-not-allowed"
                        : "text-red-500 border border-red-500 hover:bg-red-600 hover:text-white"
                    }
                  `}
              >
                {item.cancelled ? "Cancelled" : item.isCompleted ? "Completed" : "Cancel Appointment"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyAppointments;

// className="text-stone-500 text-sm text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">Cancel Appointment</button>

/*
  Complete Payment Flow (Big Picture):

    User clicks "Pay Online"
        ↓
    appointmentRazorpay()
        ↓
    Backend validates appointment
        ↓
    Backend creates Razorpay Order
        ↓
    Frontend receives order
        ↓
    initPay(order)
        ↓
    Razorpay Checkout opens
        ↓
    User pays
        ↓
    handler(response) fires
        ↓
    Send response to backend (NEXT STEP)
        ↓
    Backend verifies signature
        ↓
    Appointment marked as PAID
*/

/*
  PART 1: initPay(order) — Opening Razorpay Checkout
    const initPay = (order) => {
  
  What is order?
  This is the Razorpay order object created by our Backend.
    For Example:
    {
      "id": "order_Lk8xxxxx",
      "amount": 50000,
      "currency": "INR",
      "receipt": "65fabc123"
    }  
    This order comes from Razorpay, not our DB.

  1. Razorpay Checkout Options
     const options = {
     This object tells Razorpay how the payment should look and behave.

  2. Payment Success Handler
     handler: async (response) => {
      console.log(response);
     }

  What is response?
  When payment succeeds, Razorpay returns:
    {
      razorpay_payment_id: "pay_Lxxxx",
      razorpay_order_id: "order_Lxxxx",
      razorpay_signature: "abc123..."
    } 
  This DOES NOT mean payment is verified yet.
    
  Next Step (important):
  • Send this response to backend
  • Verify signature using key_secret

  3. Open Razorpay Popup
     const rzp = new window.Razorpay(options);
     rzp.open();

  What this does?
  • Creates Razorpay checkout instance
  • Opens payment popup
  • User completes payment (UPI / Card / NetBanking)
*/

/*
  Payment succeeded ≠ Payment verified

  When Razorpay returns:
    {
      razorpay_payment_id: "pay_Lxxxx",
      razorpay_order_id: "order_Lxxxx",
      razorpay_signature: "abc123..."
    }

  It means:
  • Money was attempted & marked successful by Razorpay UI
  • Your server has NOT yet confirmed that the payment is genuine and untampered

  Why this distinction exists (very important)

  Frontend cannot be trusted.

  A malicious user can:
  • Fake a frontend response
  • Call your /payment-success API manually
  • Send random payment_id values
  So Razorpay follows a two-step security model.
*/