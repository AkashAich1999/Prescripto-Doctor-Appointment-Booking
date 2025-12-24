import { useContext } from "react";
import { useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets.js";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  // const [userData, setUserData] = useState({
  //   name: "Edward Vincent",
  //   image: assets.profile_pic,
  //   email: "richardjameswap@gmail.com",
  //   phone: "+1 123 456 7890",
  //   address: {
  //     line1: "57th Cross, Richmond ",
  //     line2: "Circle, Church Road, London"
  //   },
  //   gender: "Male",
  //   dob: "2000-01-20"
  // });

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      
      image && formData.append("image", image);

      // if (image) {
      //   formData.append("image", image);
      // }
      console.log("Gender value:", userData.gender);
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Profile Updated");
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-sm">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img
                src={image ? URL.createObjectURL(image) : userData.image}
                className="w-36 rounded opacity-75"
                alt=""
              />
              <img src={image ? "" : assets.upload_icon}
                className="w-10 absolute bottom-12 right-12"
                alt="" />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image} alt="" />
        )}

        {isEdit ? (
          <input
            className="max-w-80 bg-gray-50 text-3xl font-medium mt-4"
            type="text"
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
            value={userData.name}
          />
        ) : (
          <p className="text-neutral-800 text-3xl font-medium mt-4">
            {userData.name}
          </p>
        )}

        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="mt-3 underline text-neutral-500">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email Id:</p>
            <p className="text-blue-500">{userData.email}</p>
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-52"
                type="text"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                value={userData.phone}
              />
            ) : (
              <p className="text-blue-400">{userData.phone}</p>
            )}
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <p>
                <input
                  className="bg-gray-50"
                  type="text"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  value={userData.address.line1}
                />
                <br />
                <input
                  className="bg-gray-50"
                  type="text"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  value={userData.address.line2}
                />
              </p>
            ) : (
              <p className="text-gray-500">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mt-3 underline text-neutral-500">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="bg-gray-100 max-w-20"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value || null }))
                }
                value={userData.gender ?? ""}
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData.gender}</p>
            )}
            <p className="font-medium ">Birthday:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-28"
                type="date"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                value={userData.dob ?? ""}
              />
            ) : (
              <p className="text-gray-400">{userData.dob}</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => updateUserProfileData()}
            >
              Save Information
            </button>
          ) : (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;

{
  /*
    The outer structure (ternary operator) :
    
    {
      isEdit
        ? (EDIT MODE UI)
        : (VIEW MODE UI)
    }


    When isEdit === true (Edit Mode), The following block runs :

    <label htmlFor="image">
      <div>
        <img src={image ? URL.createObjectURL(image) : userData.image} alt="" />
        <img src={image ? "" : assets.upload_icon} alt="" />
      </div>

      <input
        onChange={(e) => setImage(e.target.files[0])}
        type="file"
        id="image"
        hidden />
    </label>


    Q. Why <label htmlFor="image"> ?
    • This label is linked to the file input.
    • Clicking anywhere inside the label opens the file picker.
    • Because the input has:
      <input id="image" ... />
    • This is how clicking the image opens the file chooser.
    

    First <img> — profile image preview :
      <img
        src={image ? URL.createObjectURL(image) : userData.image}
        alt=""
      />
    What’s happening here ?
    This line decides which image to show.
    
    Case 1: User selected a NEW image.
      image !== null
    Then:
      URL.createObjectURL(image)
    • Creates a temporary preview URL.
    • Shows the newly selected image.
    • No upload yet.
    
    Case 2: User has NOT selected a new image.
      image === null
    Then:
      userData.image
    Shows existing profile image from database.
    
    
*/
}


{/*
  Q. What does ?? mean ?
  =>
     ?? is called the Nullish Coalescing Operator.
     Definition:  A ?? B
     
     returns A if A is NOT null or undefined.
     otherwise returns B.
*/}