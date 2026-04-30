import express from "express";
import { register, login, getGuestProfile } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/guest", getGuestProfile);

export default router;