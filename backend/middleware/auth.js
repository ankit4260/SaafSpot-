import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const JWT_SECRET = "randomstringgeneratedbyankitforcleanIndia";


function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.json({
                msg: "user not login"
            })
            return;
        }
        const jwtData = jwt.verify(token, JWT_SECRET);
        if (jwtData) {
            req.user = jwtData;
            next();
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.json({
                msg: "issue  while auth"
            })
    }
}

export default authMiddleware;

