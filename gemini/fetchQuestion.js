import { GoogleGenerativeAI } from "@google/generative-ai";

async function getQuestionPrompt(topic, subtopic, difficulty) {
    return await getResponseDelayedPrompt(`
        create a prompt to generate question description from ${subtopic} in <topic>${topic}</topic> :

        the objective is to genereate a valid and challeging question which helps the test takers to improve their skills and learn.
        make sure the prompt's goal is to find a suitable type of question (define the exact structure of the question description as well) to evaluate a student's profeciency in the {topic}
        the prompt should also contain an example as well.
         make the prompt understand the difficulty level : '${difficulty}' and creatively make the question '${difficulty}'
    higher difficulty questions should mean the questions are more verbose.
    it should take the test takers more time to solve if the difficulty is high.`
    )
}

function getQuizJsonPrompt(topic, questionPrompt, subtopic, skills, difficulty) {
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
      
      <reasoning>
           The question belongs to the subtopic '${subtopic}' about <topic>'${topic}'</topic> . Give detailed explanation why the answer is correct.
           solve it step by step and teach the test takers.
  
      If there are additional context available on the question description or the topic, provide them as well.
      The content should be useful for a student to learn and apply the same content for answering similar questions.
  
      </reasoning>

    <option and correct options>
        after doing the reasoning based on the final calculation, create 4 options and a correct option.
        verify the correctness of the options. the correct option should be exact not closest.
    </option and correct options>

    ` + `
      Output:
      give valid json
      {
            "question":question_description,
            "difficulty":("easy" or "medium" or "hard"),
            "reasoning":reasoning
      }
    `;
}

async function addOptionsToJson(question) {
    return await getResponseDelayedPrompt(
        `Output:
        <question>
        ${question["question"]}
        <question>
        <reasoning>
      ${question["reasoning"]}
        </reasoning>

        identify the correct option from the reasoning and 
      create 4 options and a correct option.
      verify the correctness of the options. the correct option should be exact not closest.
      give valid json
      {
           "options":[
                option1,
                option2,
                option3,
                option4]
           "correct_option":("A" or "B" or "C" or "D")
      }`
    );
}

async function getResponseDelayedPrompt(prompt, delay = 1000) {
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
    text = text.substring(start, end + 1);
    const json = JSON.parse(text);
    return json;
}

function notValidQuizJson(quizJson) {
    return !quizJson.hasOwnProperty("question") || !quizJson.hasOwnProperty("difficulty") || !quizJson.hasOwnProperty("reasoning") || !quizJson.hasOwnProperty("options") || !quizJson.hasOwnProperty("correct_option");
}

export default async function getValidQuizJsonRecursive(topic, subtopic, difficulty, cnt = 0) {
    const skills = "";
    const questionPrompt = await getQuestionPrompt(topic, subtopic, difficulty);
    const quizJsonPrompt = getQuizJsonPrompt(topic, questionPrompt, subtopic, skills, difficulty);

    try {
        var quizJsonResponseWithoutOptions = await getResponseDelayedPrompt(quizJsonPrompt);
        var quizJson = jsonParse(quizJsonResponseWithoutOptions);
        var quizJsonResponse = await addOptionsToJson(quizJson);
        var optionsJson = jsonParse(quizJsonResponse);
        quizJson["options"] = optionsJson["options"];
        quizJson["correct_option"] = optionsJson["correct_option"];

        if (notValidQuizJson(quizJson)) {
            throw new Error("quizJson is not valid");
        }

        return quizJson
    } catch (error) {

        if (cnt > 2 || error.constructor.name === "ResourceExhausted") {
            return {}
        }
        console.log("no. of recursive calls :" + cnt);
        console.log("question error:", error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await getValidQuizJsonRecursive(topic, subtopic, difficulty, cnt + 1);
    }
}


export async function geminiCall() {

    const prompt = "give me 5 neet questions";
    const result = await model.generateContent([prompt]);

    return result.response.text();
}
const genAI = new GoogleGenerativeAI("AIzaSyB6cPDFKr1kZqMsWa9pg3BRAcFSzUJk_pM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
