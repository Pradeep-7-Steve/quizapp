import { GoogleGenerativeAI } from "@google/generative-ai";

async function getQuestionPrompt(topic, subtopic, difficulty) {
    return await getResponseDelayedPrompt(`
               create a prompt to generate question description from ${subtopic} in <topic>${topic}</topic> :

        the objective is to generate a valid and challenging question which helps the test takers improve their skills and learn.
        make sure the prompt's goal is to find a suitable type of question (define the exact structure of the question description as well) to evaluate a student's proficiency in the {topic}.
        the prompt should also contain an example.
        
        The prompt should make the question generator understand the difficulty level: '${difficulty}' and creatively make the question '${difficulty}'.
        higher difficulty questions should mean the questions complex to solve. **Don't make the questions verbose based on difficulty level**.
        it should take the test takers more time to solve if the difficulty is high.`
    )
}

function getQuizJsonPrompt(topic, questionPrompt, subtopic, difficulty) {
    return `
      ${questionPrompt}

      <question rules>
      *The question must be formed so that it has an unambiguous and a single answer.*
      **question_description must not contain any options or correct answer**
      The question belongs to the subtopic '${subtopic}' about <topic>'${topic}'</topic> .
      </question rules>

      <difficulty>
        ${difficulty}
      </difficulty>
      
      <reasoning>
           Check the correctness of the question, if not generate a new question.
           solve it step by step and teach the test takers.
      </reasoning>

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

async function getReasoningWithCorrectOptions(question) {
    return await getResponseDelayedPrompt(
        ` 
        <question>
        ${JSON.stringify(question["question"])}
        ${JSON.stringify(question["reasoning"])}
        </question>

        <options>
        ${JSON.stringify(question["options"])}
        </options>

        Please analyze the question carefully and choose the correct option from the following steps:
        
        1. **Understand the Question**: Summarize what the question is asking in simple terms.
        2. **Analyze the Options**: Review each option and eliminate any incorrect ones, explaining why they are wrong.
        3. **Reasoning for the Correct Option**: Once you have identified the correct answer, explain why it is the most accurate based on the question. there can be more than one potential correct answer.
        Ensure that your explanation includes why you are performing each step, what concepts are being applied, and how the solution progresses logically.
Finally, conclude by summarizing what the test taker should learn from this problem.

        4. **Correct Options**: State the correct options in terms of (A, B, C, D).

        Provide a detailed step-by-step reasoning process for selecting the correct answer.

        Output:
        give all potential correct options as a list
        give valid json
      {
           "detailed_explanation": reasoning,
           "correct_options": ["A", "B", "C", "D"]
      }
        `
    );
}

async function getReasoning(question, topic, subtopic) {
    return await getResponseDelayedPrompt(
        ` 
        <question>
        ${JSON.stringify(question["question"])}
        </question>
        <topic and subtopic>
        ${JSON.stringify(question["topic"])} and ${JSON.stringify(question["subtopic"])}
        </topic and subtopic>


        for the above question
After that, solve the question step by step. For each step:
For each step **explain what you did** and **explain what you learned**
evaluate each step, and correct yourself.

**give the correct answer to the asked question**`
    );
}

async function addOptionsToJson(question) {
    return await getResponseDelayedPrompt(
        `Output:
        <question>
        ${JSON.stringify(question["question"])}
        <question>
        <reasoning>
      ${JSON.stringify(question["reasoning"])}
        </reasoning>

        identify the correct option from the reasoning and 
      create 4 options where any one of them is the correct option
      verify the correctness of the options.

      <rules>
      options should directly answer the question asked. usually one word or number maybe followed by a unit.
      if it has multiple blanks then use a comma to separate the answers for each blank.
      </rules>
      
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

async function getResponseDelayedPrompt(prompt, delay = 50) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    try {
        const rawResponse = await models[API_KEY_index].generateContent([prompt]);
        API_KEY_index = (API_KEY_index + 1) % models.length;
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

function validQuizJson(quizJson) {
    return quizJson.hasOwnProperty("question") || quizJson.hasOwnProperty("difficulty") || quizJson.hasOwnProperty("reasoning") || quizJson.hasOwnProperty("options") || quizJson.hasOwnProperty("correct_option") ||
    quizJson["options"].length == 4 || quizJson["correct_option"] === "A" || quizJson["correct_option"] === "B" || quizJson["correct_option"] === "C" || quizJson["correct_option"] === "D";
}


function jsonToMarkdown(jsonObject, indentLevel = 0) {
    let markdown = "";
    const indent = "  ".repeat(indentLevel); // 2 spaces per indent level

    if (typeof jsonObject === "object" && jsonObject !== null) {
        for (const key in jsonObject) {
            if (Object.prototype.hasOwnProperty.call(jsonObject, key)) {
                markdown += `${indent}**${key}**: `;
                if (typeof jsonObject[key] === "object" && jsonObject[key] !== null) {
                    markdown += "\n" + jsonToMarkdown(jsonObject[key], indentLevel + 1);
                } else {
                    markdown += `${jsonObject[key]}\n`;
                }
            }
        }
    } else if (Array.isArray(jsonObject)) {
        for (const item of jsonObject) {
            markdown += `${indent}- `;
            if (typeof item === "object" && item !== null) {
                markdown += "\n" + jsonToMarkdown(item, indentLevel + 1);
            } else {
                markdown += `${item}\n`;
            }
        }
    } else {
        markdown += `${jsonObject}\n`;
    }

    return markdown;
}

export default async function getValidQuizJsonRecursive(topic, subtopic, difficulty, cnt = 0) {
    const questionPrompt = await getQuestionPrompt(topic, subtopic, difficulty);
    const quizJsonPrompt = getQuizJsonPrompt(topic, questionPrompt, subtopic, difficulty);
    const optionMap = {
        "0" : "A",
        "1" : "B",
        "2" : "C",
        "3" : "D",
    };

    try {
        var quizJsonResponseWithoutOptions = await getResponseDelayedPrompt(quizJsonPrompt);
        var quizJson = jsonParse(quizJsonResponseWithoutOptions);

        if (!quizJson.hasOwnProperty("question")) {
            throw new Error("quizJson does not contain question");
        }
        if(typeof quizJson["question"] !== "string"){
            quizJson["question"] = jsonToMarkdown(quizJson["question"])
        }

        quizJson["reasoning"] = await getReasoning(quizJson, topic, subtopic);
        var quizJsonResponse = await addOptionsToJson(quizJson);
        var optionsJson = jsonParse(quizJsonResponse);
        quizJson["options"] = optionsJson["options"];
        quizJson["correct_option"] = optionsJson["correct_option"];
        quizJson["difficulty"] = difficulty

        var reasoningWithCorrectOption = await getReasoningWithCorrectOptions(quizJson);
        var reasoningWithCorrectOptionJson = jsonParse(reasoningWithCorrectOption);
        quizJson["detailed_explanation"] = reasoningWithCorrectOptionJson["detailed_explanation"];
        quizJson["correct_options"] = reasoningWithCorrectOptionJson["correct_options"];

        if(typeof quizJson["reasoning"] !== "string"){
            quizJson["reasoning"] = jsonToMarkdown(quizJson["reasoning"])
        }

        if(!["A", "B", "C", "D"].includes(quizJson["correct_option"])){
            for(let ind = 0; ind < quizJson["options"].length; ind++){
                if(quizJson["options"][ind].includes(quizJson["correct_option"])){
                    quizJson["correct_option"] = optionMap[ind.toString()]
                }
            }
        }

        if (!validQuizJson(quizJson)) {
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
const API_KEYs = [
    "AIzaSyC6F0-bUwVhQt-19g2yIru70SnPjgK8aPE",
    "AIzaSyCgGCS5PuH_cP8UULH3598NmLZc8weFX2I",
    "AIzaSyDQm3qK6cnTuhi381GtwaRPAnQIg5TfWyg",
    "AIzaSyB6cPDFKr1kZqMsWa9pg3BRAcFSzUJk_pM",
    "AIzaSyA6sj3Nu0xa_ZvqkaE__i2tafTRcZcI3Eg"
]
var models = []
var genAIs = []
var API_KEY_index = 0;
for(let i = 0; i < API_KEYs.length; i++)
{
    const genAI = new GoogleGenerativeAI(API_KEYs[i]);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    models.push(model);
    genAIs.push(genAI);
}