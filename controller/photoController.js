import Photo from "../models/photoModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const createPhoto = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "photo_app",
    }
  );

  try {
    await Photo.create({
      name: req.body.name,
      description: req.body.description,
      user: res.locals.user._id,
      url: result.secure_url,
    });

    fs.unlinkSync(req.files.image.tempFilePath);

    res.status(201).redirect("/users/dashboard");
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message,
    });
  }
};

const getAllPhotos = async (req, res) => {
  try {
    const photos = res.locals.user
      ? await Photo.find({ user: { $ne: req.params.id } })
      : await Photo.find();
    res.status(200).render("photos", {
      photos,
      link: "photos",
    });

    res.status(200).render("photos", {
      photos,
      link: "photos",
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error,
    });
  }
};

const getAPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById({
      _id: req.params.id,
    }).populate("user");
    res.status(200).render("photo", {
      photo,
      link: "photos",
    });
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error,
    });
  }
};

export { createPhoto, getAllPhotos, getAPhoto };
