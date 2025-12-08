import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
  const navigate = useNavigate();
  const {doctors} = useContext(AppContext);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
        <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
        <p className="sm:w-1/3 text-center text-sm">Simply browse through our extensive list of trusted doctors.</p>
        <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
            {doctors.slice(0, 12).map((item, index) => (
                <div onClick={() => navigate(`/appointment/${item._id}`)} key={index} className="border border-blue-200 rounded-xl cursor-pointer hover:translate-y-[-10px] transition-all duration-500 overflow-hidden">
                    <img src={item.image} alt="" className="bg-blue-50" />
                    <div className="p-4">
                        <div className="flex items-center gap-2 text-sm text-center text-green-500">
                            <p className="w-2 h-2 bg-green-500 rounded-full"></p><p>Available</p>
                        </div>
                        <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                        <p className="text-gray-600 text-sm">{item.speciality}</p>
                    </div>
                </div>
            ))}
        </div>
        <button className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10">more</button>
    </div>
  )
}

export default TopDoctors;

{/**
    We added following in the tailwind.config.js file :
    
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(200px, 1fr))'
      }
*/}

{/**
    grid-cols-auto   -->	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));    
    
    1. repeat(auto-fill, …)
    
      - The grid fills each row with as many columns as possible
      - When space is not enough, the next items wrap to the next row
      - No need to manually specify grid-cols-3, grid-cols-4, etc.

    2. minmax(200px, 1fr)

      - This sets the minimum and maximum width for each column :
        • Minimum width = 200px
        • Maximum width = 1fr (fraction of available space)
      - So each card behaves like:
        “Be at least 200px wide, but if there is more room, stretch to fill the row.”
*/}