import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    // <div className="min-h-[70vh] flex items-center justify-center text-2xl">
    //   404 - Page Not Found
    // </div>

    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      
      {/* 404 text */}
      <h1 className="text-7xl font-bold text-primary animate-bounce">
        404
      </h1>

      <p className="mt-4 text-xl text-gray-600">
        Oops! Page not found
      </p>

      <p className="mt-2 text-sm text-gray-500">
        The page you are looking for doesn’t exist.
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-2 bg-primary text-white rounded-full hover:scale-105 transition-transform duration-200"
      >
        Go Back Home
      </button>
    </div>  
  );
};

export default NotFound;