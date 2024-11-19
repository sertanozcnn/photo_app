import express from "express";
import * as userController from "../controller/userController.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/register").post(userController.createUser);
router.route("/login").post(userController.loginUser);
router
  .route("/dashboard")
  .get(authMiddleware.authenticationToken, userController.getDashboardPage);

router
  .route("/")
  .get(authMiddleware.authenticationToken, userController.getAllUsers);
router
  .route("/:id")
  .get(authMiddleware.authenticationToken, userController.getAUsers);
export default router;
