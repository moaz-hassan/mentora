

import { body, param } from "express-validator";

export const createChatRoomValidator = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
];

export const createMessageValidator = [
  body("room_id")
    .notEmpty()
    .withMessage("Room ID is required"),
  
  body("sender_id")
    .optional()
    .trim(),
  
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required"),
];

export const chatRoomIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Chat room ID is required"),
];

export const messageIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Message ID is required"),
];
