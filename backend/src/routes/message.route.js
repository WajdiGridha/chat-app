import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getMessages,
    getUsersForSidebar,
    sendFileMessage,
    sendMessage,
} from "../controllers/message.controller.js";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }); // Use a single multer config

const router = express.Router();

// Get all users except the logged-in user
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages with a specific user
router.get("/:id", protectRoute, getMessages);

// Send text or image message
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);

// Send PDF/DOCX file message
router.post("/upload-file/:id", protectRoute, upload.single("file"), sendFileMessage);

export default router;
