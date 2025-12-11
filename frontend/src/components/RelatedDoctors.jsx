import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({ docId, speciality }) => {
  const { doctors } = useContext(AppContext);  
  const [relDocs, setRelDocs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
        const relatedDoctors = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId);
        setRelDocs(relatedDoctors);
    }
  }, [doctors, docId, speciality]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
        <h1 className="text-3xl font-medium">Related Doctors</h1>
        <p className="sm:w-full text-center text-sm">Simply browse through our extensive list of trusted doctors.</p>
        <div className="w-full mx-auto grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
            {relDocs.slice(0, 5).map((item, index) => (
                <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0); }} key={index} 
                 className="border border-blue-200 rounded-xl cursor-pointer hover:translate-y-[-10px] transition-all duration-500 overflow-hidden">
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
       
    </div>
  )
}

export default RelatedDoctors;