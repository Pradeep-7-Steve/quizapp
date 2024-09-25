import geminiCall from "../gemini/fetchQuestion.js";
import getValidQuizJson from "../gemini/fetchQuestion.js";
import getValidTopics from "../gemini/fetchTopics.js";

export const getQuestion = async (req, res) => {
    res.status(200);   
    res.json(await getValidQuizJson(
        "Create a multiple choice question for the topic 'Logical Reasoning' with four options where one of them is correct. The question should be in the following format: 'What is the next number in the series 1, 2, 4, 8, 16?' and the options should be in the format 'A) 32' and 'B) 31'. The correct answer should be 'A) 32'. The reasoning for the answer should be 'The pattern of the series is to multiply the previous number by 2'. The difficulty level should be 'Easy'.",
        "Clocks",
        "logical-reasoning",
        "Medium"
    ));
}

export const getTopics = async (req, res) => {
    res.status(200);   
    res.json(await getValidTopics("Logical Reasoning"));
}