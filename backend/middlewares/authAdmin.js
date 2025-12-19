import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        // Step 1: Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not Authorized - Login Again" });
        }

        // Step 2: Extract token
        const token = authHeader.split(" ")[1];
        console.log("Auth Header:", req.headers.authorization);

        // Step 3: Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 4: Validate admin credentials from token
        if (decoded.role !== "admin" || decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }

        // Step 5: Attach admin info (optional but useful)
        req.admin = decoded;

        // Step 6: Proceed
        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
    }
}

export default authAdmin;

{/*
  Q1. What is req.headers.authorization ?
     
  => Every HTTP request has headers :
        GET /api/admin HTTP/1.1
        Host: example.com
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        Content-Type: application/json  
     
     In Express, all headers are available as :
        req.headers
  
     So this line :
        const authHeader = req.headers.authorization;
     means :
        “Get the value of the Authorization header from the incoming request.”      
*/}

{/*
  Q2. What does Authorization header contain ?
  
  => By convention (RFC 6750), JWTs are sent like this :
        Authorization: Bearer <JWT_TOKEN>
     Example:
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     So:
        authHeader === "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."      
*/}

{/*
  Q3. Why does it start with "Bearer " ?
  
  => Bearer means: “Whoever holds (bears) this token is authorized”

     It is a standard authentication scheme defined by HTTP specs.

     Bearer → token-based auth (JWT, OAuth)

     JWT must be sent as Bearer token (best practice).
*/}

{/*
    const token = authHeader.split(" ")[1];
    
    Extracts only the JWT, removing "Bearer ".
*/}

{/*
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
      So decoded will look like following :

      {
        role: "admin",
        email: "admin@prescripto.com",
        iat: 1765772030,
        exp: 1765858430
      }
*/}

{/*
    403 Forbidden = "I know who you are, but you don't have permission."
    
    Server understands the request + authenticates you, but refuses access due to insufficient permissions.

    401 Unauthorized	Not logged in	                (No JWT token, wrong password)
    403 Forbidden	    Logged in but no permission     (User tries admin route)

    Quick Summary (CLIENT ERROR status codes) :
    400 = "Bad data"
    401 = "Login first" 
    403 = "You can't do that" (permissions)
*/}


{/*
  NOTE: will do it later.

  Q. How the frontend must send the request ?
  => 
    const token = localStorage.getItem("adminToken"); // token from login

    fetch("/api/doctor/add", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${token}`,  // <- important
        "Content-Type": "application/json"
    },
    body: JSON.stringify(doctorData)
    });  

*/}