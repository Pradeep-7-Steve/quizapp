import express from "express";
import { get_question } from "../controllers/question_controller.js";

const question_router = express.Router();

question_router.get('/', get_question);

export default question_router;