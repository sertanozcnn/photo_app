import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.userId);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const authenticationToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          console.log(err.message);
          return res.redirect("/login");
        } else {
          try {
            const user = await User.findById(decoded.userId);
            if (!user) {
              return res
                .status(401)
                .json({ succeeded: false, error: "User not found" });
            }
            req.user = user;
            next();
          } catch (dbError) {
            console.error(dbError);
            return res
              .status(500)
              .json({ succeeded: false, error: "Database error" });
          }
        }
      });
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message,
    });
  }
};

export { authenticationToken, checkUser };
