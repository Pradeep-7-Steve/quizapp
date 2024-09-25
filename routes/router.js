import express from "express";
import { getQuestion, getTopics } from "../controllers/controller.js";

const questionRouter = express.Router();
questionRouter.get('/', getQuestion);
export default questionRouter;

export const topicsRouter = express.Router();
topicsRouter.get('/', getTopics);