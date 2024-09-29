import getValidQuizJsonRecursive from "../gemini/fetchQuestion.js";
import getValidTopics from "../gemini/fetchTopics.js";

export const getQuestion = async (req, res) => {
    res.status(200);   
    res.json(await getValidQuizJsonRecursive(
        req.query.topic,
        req.query.subtopic,
        req.query.difficulty,
    ));
}

export const getTopics = async (topic) => {
    return await getValidTopics(topic);
}
