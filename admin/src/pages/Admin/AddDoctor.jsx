import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, token } = useContext(AdminContext);
  const navigate = useNavigate();
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Validate image
        if (!docImg) {
            return toast.error("Image Not Selected");
        }

        // 2. Create FormData
        const formData = new FormData();
        formData.append("image", docImg);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("experience", experience);
        formData.append("fees", Number(fees));
        formData.append("about", about);
        formData.append("speciality", speciality);
        formData.append("degree", degree);
        formData.append("address", JSON.stringify({ line1:address1, line2:address2 }));

        // console log formData (Debug FormData)
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        // 4. API call
        const { data } = await axios.post(
            `${backendUrl}/api/admin/add-doctor`, 
            formData, 
            { headers: { 
                Authorization: `Bearer ${token}`, 
              },  
            }
        );

        setDocImg(null);
        setName("");
        setPassword("");
        setEmail("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setAbout("");
        setFees("");

        toast.success("Doctor added successfully!");
        navigate("/admin/doctors");  // Redirect

    } catch (error) {
      console.error("Add Doctor Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="w-full m-5">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white py-8 px-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img className="w-16 bg-gray-100 rounded-full cursor-pointer" src={ docImg ? URL.createObjectURL(docImg) : assets.upload_area } alt="" />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>
            upload doctor <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} className="border rounded px-3 py-2" type="text" placeholder="Name" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className="border rounded px-3 py-2" type="email" placeholder="Email" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2" type="password" placeholder="Password" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select onChange={(e) => setExperience(e.target.value)} value={experience} className="border rounded px-3 py-2" name="" id="">
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input onChange={(e) => setFees(e.target.value)} value={fees} className="border rounded px-3 py-2" type="number" placeholder="fees" required />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">

            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className="border rounded px-3 py-2" name="" id="">
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input onChange={(e) => setDegree(e.target.value)} value={degree} className="border rounded px-3 py-2" type="text" placeholder="Education" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input onChange={(e) => setAddress1(e.target.value)} value={address1} className="border rounded px-3 py-2" type="text" placeholder="address 1" />
              <input onChange={(e) => setAddress2(e.target.value)} value={address2} className="border rounded px-3 py-2" type="text" placeholder="address 2" />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2 text-gray-600">About Doctor</p>
          <textarea onChange={(e) => setAbout(e.target.value)} value={about} className="w-full px-4 pt-2 border rounded" placeholder="write something about doctor..." rows={5} required />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-primary px-10 py-3 mt-4 text-white rounded-full
            disabled:cursor-not-allowed disabled:opacity-50">
            { loading ? "Adding Doctor..." : "Add Doctor" }
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;

{
  /* 
    1. Hidden File Input :
       <input type="file" id="doc-img" hidden />

       • Native ugly file input (browser default)
       • Hidden by CSS (not shown in your snippet, but assumed)    

    2. Clickable Label Replacement :
       <label htmlFor="doc-img">
           <img src={assets.upload_area} alt="" />
       </label>

       • htmlFor="doc-img" = Links label to input
       • Clicking image = Triggers file input click
       • Beautiful custom UI instead of ugly browser input   
*/
}

{/* 
    URL.createObjectURL(docImg) 
    creates a temporary browser URL for a File/Blob object (like selected image).

    What It Does:
    Converts a File object (from <input type="file">) into a browser-accessible URL 
    like blob:http://localhost:8000/abc-123.    
*/}