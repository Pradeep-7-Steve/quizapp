import { GoogleGenerativeAI } from "@google/generative-ai";

function getQuizJsonPrompt(questionPrompt, subtopic, skills, difficulty) {
    return `
      ${questionPrompt}

      Topic:
      The questions should strictly be from the topic <topic>'${subtopic}'</topic>.

      It should Test the following skills:
      <skills>
      ${skills}
      </skills>

      difficulty level : '${difficulty}' and creatively make the question '${difficulty}'
    higher difficulty questions should mean the questions are more verbose.
    it should take the test takers more time to solve if the difficulty is high.

    ` + `
      Output:
      give python
      {
            "question":question_description,
            "options":[option1,option2,option3,option4],
            "correct_option":("A" or "B" or "C" or "D"),
            "reasoning":reasoning
      }
    give python output
    `;
}

async function getResponseDelayedPrompt(prompt, delay=1000) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    try {
        const rawResponse = await model.generateContent([prompt]);
        return rawResponse.response.text();
    } catch (error) {
        if (error.constructor.name === "ResourceExhausted") {
            return await getResponseDelayedPrompt(prompt, delay * 2);
        } else {
            console.log(error);
            return null;
        }
    }
}

function jsonParse(text) {
    var start = text.indexOf("{");
    var end = text.lastIndexOf("}");
    text = text.substring(start, end+1);
    const json = JSON.parse(text);
    return json;
}

export default async function getValidQuizJson(questionPrompt, subtopic, skills, difficulty) {
    const quizJsonPrompt = getQuizJsonPrompt(questionPrompt, subtopic, skills, difficulty);
    var quizJsonResponse = await getResponseDelayedPrompt(quizJsonPrompt);

    try {
        return jsonParse(quizJsonResponse);
    } catch (error) {
        console.log(error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await getValidQuizJson(questionPrompt, subtopic, skills, difficulty);
    }
}


export async function geminiCall(){

    const prompt = "give me 5 neet questions";
    const result = await model.generateContent([prompt]);

    return result.response.text();
}
const genAI = new GoogleGenerativeAI("AIzaSyB6cPDFKr1kZqMsWa9pg3BRAcFSzUJk_pM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
