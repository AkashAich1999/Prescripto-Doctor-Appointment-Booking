import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const {docId} = useParams();
  const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
    // console.log(docInfo);
  }

  // generate 7 days of time slots (today + next 6 days), 
  // where each day has 30-minute intervals from 10:00 AM to 9:00 PM.
  const getAvailableSlots = async () => {
    setDocSlots([]);  // Before generating slots, we Clear the previous data.

    // getting today’s date.
    let today = new Date();

    for (let i = 0; i < 7; i++) { // Loop for 7 days.
      // Create current date for each loop.
      let currentDate = new Date();
      currentDate.setDate(today.getDate() + i);

      // Set the END time of the day (9 PM).
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);  // So every day ends at 21:00 / 9 PM.

      // Set the START time of the day.
      if (today.getDate() === currentDate.getDate()) {  // If it is TODAY.
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {  // Future days always start at 10:00 AM.
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      // Generate slots in 30-minute increments.
      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });   // date.toLocaleTimeString([locales], [options])

        // add slot to array.
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        });

        // Increment current time by 30 minutes.
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      // Save the day’s slots.
      setDocSlots(prev => ([...prev, timeSlots]));
    }
  }

  const bookAppointment = async () => {
    // 1. AUTH Check.
    if (!token) {
      toast.warn("Login to Book Appointment");
      navigate("/login");   // Redirect to login
      return;   // Stop execution
    }

    // 2. Slot validations
    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    try {
      // 3. Extract DATE from Selected Slot.
      const date = docSlots[slotIndex][0].datetime;
      console.log(date);

      // 4. Format date as "DD_MM_YYYY"
      let day = date.getDate();         // 25
      let month = date.getMonth() + 1;  // Jan --> 0, Dec --> 11 Therefore, we need +1. (JS months 0-indexed!)
      let year = date.getFullYear();    // 2025

      const slotDate = `${day}_${month}_${year}`;  // "25_12_2025"
      console.log(slotDate);   // Debug: "25_12_2025"

      // 5. API call
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { 
          docId, slotDate, slotTime
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 6. Response handling
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(error.response?.data?.message || "Booking Failed");
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return docInfo && (
    <div>
      {/* ---------- Doctor Details ---------- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="w-full sm:max-w-72 bg-primary rounded-lg" src={docInfo?.image} alt="" />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg bg-white p-8 py-7 mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          {/* ---------- Doc Info: name, degree, experience ---------- */}
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name} 
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
          </div>

          {/* ---------- Doctor About ---------- */}
          <div>
            <p className="flex gap-1 items-center text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
          </div> 

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee: <span className="text-gray-600">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ---------- Booking Slots ---------- */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking Slots</p>
        <div className="flex gap-3 items-center w-full mt-4 overflow-x-scroll">
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`py-6 min-w-16 rounded-full text-center cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : '' }`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>  
            ))
          }
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {docSlots.length && docSlots[slotIndex].map((item, index) => (
            <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light px-5 py-2 rounded-full flex-shrink-0 cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300' }`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button onClick={bookAppointment} className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">Book an appointment</button>
  
      </div>

      {/* Listing Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment;

/**
  docSlots = [
    [[{datetime: Fri Dec 12 2025 10:00:34 GMT+0530 (India Standard Time), time: '10:00 AM'}], [
{datetime: Fri Dec 12 2025 10:30:34 GMT+0530 (India Standard Time), time: '10:30 AM'}],  ........]
    [[], [], ......]
    [[], [], ......]
    [[], [], ......]
    [[], [], ......]
    [[], [], ......]
    [[], [], ......]
  ]  

  So :
  • item = one day’s slots = an array.
  • item[0] = the first slot of that day.
  • item[0].datetime = actual Date object.
*/

/**
  • const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];.
  
  • item[0].datetime.getDay() returns a number from 0 to 6.
  • daysOfWeek[item[0].datetime.getDay()].

  • Suppose, item[0].datetime.getDay() returns 5,
  • Then, daysOfWeek[5] => 'FRI' 
 */

 /*
  setDocSlots(prev => ([...prev, timeSlots]));
        ↑        ↑       ↑        ↑
        |        |       |        |
    Update  Previous  Spread    NEW day's slots
    state     state   existing  (timeSlots array)
               ↓       ↓
         Function    Create NEW array
           ↓          with old + new
    React-safe update!
 
 */ 

/*
    docSlots = [                 // Array of 7 DAYS
      [                          // Day 1 (Today)
        {datetime: Date, time: "10:00"},  // Slot 0
        {datetime: Date, time: "10:30"},  // Slot 1 ← User clicked this!
        {datetime: Date, time: "11:00"},  // Slot 2
        ...
      ],
      [                          // Day 2
        {datetime: Date, time: "10:00"},
        ...
      ]
    ]


    Q. Explain the Following Part:
       const date = docSlots[slotIndex][0].datetime;  ?
    => 
       User clicks Day 2, Slot 1 ("10:30")
       
       slotIndex = 1;  // Selected Slot Position in Day.

       docSlots[slotIndex]      // ❌ WRONG: Gets DAY (array)
       docSlots[slotIndex][0]   // ❌ WRONG: Gets FIRST slot of that day

       ✅ CORRECT: Gets SELECTED slot's Date
       const date = docSlots[slotIndex][0].datetime;   
*/