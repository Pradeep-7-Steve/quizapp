import getValidQuizJsonRecursive from "../gemini/fetchQuestion.js";
import getValidTopics from "../gemini/fetchTopics.js";

export const getQuestion = async (req, res) => {
    res.status(200);   
    res.json(await getValidQuizJsonRecursive(
        "Aptitude",
        "Time and Distance",
        "hard"
    ));
}

export const getTopics = async (req, res) => {
    res.status(200);   
    res.json(await getValidTopics("Logical Reasoning"));
}