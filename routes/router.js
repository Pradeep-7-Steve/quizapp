import express from "express";
import { getQuestion, getTopics } from "../controllers/controller.js";

const questionRouter = express.Router();
questionRouter.get('/', getQuestion);
export default questionRouter;

export const topicsRouter = express.Router();
topicsRouter.get('/', async (req, res) => {
    try {
        const topics = await getTopics(req.query.topic);
        res.status(200);
        res.json(topics);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
