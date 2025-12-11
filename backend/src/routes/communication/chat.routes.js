import express from "express";
import * as chatController from "../../controllers/communication/chat.controller.js";
import { createChatRoomValidator, createMessageValidator, chatRoomIdValidator, messageIdValidator } from "../../validators/communication/chat.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();




router.get("/rooms", authenticate, chatController.getAllChatRooms);


router.get("/rooms/:id", authenticate, chatRoomIdValidator, validateResult, chatController.getChatRoomById);


router.get("/rooms/course/:courseId", authenticate, chatController.getChatRoomByCourseId);


router.post("/rooms", authenticate, authorize("instructor", "admin"), createChatRoomValidator, validateResult, chatController.createChatRoom);


router.delete("/rooms/:id", authenticate, authorize("admin"), chatRoomIdValidator, validateResult, chatController.deleteChatRoom);


router.get("/rooms/:roomId/messages", authenticate, chatController.getMessagesByRoomId);




router.get("/messages/:id", authenticate, messageIdValidator, validateResult, chatController.getMessageById);


router.post("/messages", authenticate, createMessageValidator, validateResult, chatController.createMessage);


router.delete("/messages/:id", authenticate, messageIdValidator, validateResult, chatController.deleteMessage);




router.get("/user/rooms", authenticate, chatController.getUserChatRooms);


router.post("/private", authenticate, chatController.createPrivateChat);


router.put("/rooms/:roomId/read", authenticate, chatController.markChatAsRead);


router.get("/unread-count", authenticate, chatController.getUnreadCount);


router.get("/rooms/:roomId/messages/paginated", authenticate, chatController.getRoomMessagesPaginated);


router.post("/join", authenticate, chatController.joinGroupChat);


router.get("/membership/:courseId", authenticate, chatController.checkChatMembership);




router.get("/:roomId/messages/cursor", authenticate, chatController.getRoomMessagesWithCursor);


router.post("/:roomId/message", authenticate, chatController.sendMessageWithCache);

export default router;
