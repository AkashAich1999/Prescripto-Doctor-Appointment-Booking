import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="speciality"
    >
      <h1 className="text-3xl font-medium">Find by Speciality</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors, schedule
        your appointment hassle-free.
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {" "}
        {/** justify-center is used on flex or grid containers. It aligns items along the main axis (horizontal by default). */}
        {specialityData.map((item, index) => (
          <Link
            onClick={() => scrollTo(0, 0)}
            className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500" 
            key={index}       
            to={`/doctors/${item.speciality}`}
          > 
            <img className="w-16 sm:w-24 mb-2" src={item.image} alt="" />
            <p>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;

{/** flex-shrink-0 = “Don’t squeeze this element” */}

{/** 
  onClick={() => scrollTo(0, 0)}
  It scrolls the page back to the top when you click something.
  
  scrollTo(x, y) => A built-in browser function that moves the scrollbar to a particular position.

  scrollTo(0, 0)
   0 (x-axis): scroll horizontally to left
   0 (y-axis): scroll vertically to top 
*/}