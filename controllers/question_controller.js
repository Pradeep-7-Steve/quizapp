import gemini_call from "../controllers/gemini/fetch_question.js";

export const get_question = async (req, res) => {
    res.status(200);   

    let question = {
        description: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        correct_option: "A",
        explanation: "Paris is the capital of France"
    }

    res.json(await gemini_call());
    
}