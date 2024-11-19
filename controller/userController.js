import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Photo from "../models/photoModel.js";

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      user: user._id,
    });

    res.redirect("/login");
  } catch (error) {
    let errors2 = {};

    if (error.code === 11000) {
      errors2.email = "The email is already in use";
    }

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }

    res.status(400).json(errors2);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    let same = false;
    if (user) {
      same = await bcrypt.compare(password, user.password);
    } else {
      return res.status(401).json({
        succeeded: false,
        error: "There is no user with that username",
      });
    }

    if (same) {
      const token = createToken(user._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect("/users/dashboard");
    } else {
      res.status(401).json({
        succeeded: false,
        error: "Passwords are not matched",
      });
    }
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message,
    });
  }
};

const getDashboardPage = async (req, res) => {
  const photos = await Photo.find({ user: res.locals.user._id });
  res.render("dashboard", {
    link: "dashboard",
    photos,
  });
};

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: res.locals.user._id },
    });

    res.status(200).render("users", {
      users,
      link: "users",
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error,
    });
  }
};

const getAUsers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const photos = await Photo.find({ user: req.params.id });

    res.status(200).render("user", {
      user,
      photos,
      link: "users",
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message,
    });
  }
};

export { createUser, loginUser, getDashboardPage, getAUsers, getAllUsers };
