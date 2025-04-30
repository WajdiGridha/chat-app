import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import streamifier from "streamifier";

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper for uploading buffer to Cloudinary
const streamUpload = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });

// Get all users except the logged-in one
export const getUsersForSidebar = async (req, res) => {
    try {
        const LoggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: LoggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get messages between the logged-in user and another user
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Send text and/or image message
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = null;
        if (req.file) {
            try {
                const result = await streamUpload(req.file.buffer);
                imageUrl = result.secure_url;
            } catch (err) {
                console.error("Image upload error:", err);
                return res.status(500).json({ error: "Image upload failed" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl || undefined,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        console.log("Text:", text);
        console.log("Image:", req.file ? req.file.originalname : "No image");
        console.log("SenderId:", senderId, "ReceiverId:", receiverId);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Send a file message (PDF, DOCX, etc.)
export const sendFileMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await streamUpload(req.file.buffer);
        const fileUrl = result.secure_url;

        const newMessage = new Message({
            senderId,
            receiverId,
            file: fileUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        console.log("Uploaded File:", req.file.originalname);
        console.log("SenderId:", senderId, "ReceiverId:", receiverId);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendFileMessage:", error.message);
        res.status(500).json({ message: "File message failed" });
    }

};
