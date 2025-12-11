import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p className="">CONTACT <span className="font-semibold text-gray-700">US</span></p>
      </div>

      <div className="my-10 flex flex-col md:flex-row justify-center gap-10 text-sm mb-28">
        <img className="w-full md:max-w-[360px]" src={assets.contact_image} alt="" />
        <div className="flex flex-col gap-6 justify-center items-start">
          <p className="text-lg font-semibold text-gray-600">OUR OFFICE</p>
          <p className="text-gray-500">54709 Willms Station <br  /> Suite 350, Washington, USA</p>
          <p className="text-gray-500">Tel: (415) 555-0132 <br /> Email: greatstackdev@gmail.com </p>
          <p className="text-lg font-semibold text-gray-600">Careers at PRESCRIPTO</p>
          <p className="text-gray-500">Learn more about our teams and job openings.</p>
          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">Explore Jobs</button>
        </div>
      </div>
    </div>
  )
}

export default Contact;