import { GoogleGenerativeAI } from "@google/generative-ai";


async function getTopics(topic) {

    const result =await model.generateContent([`Task:

        i want to learn ${topic},
        create 25 subtopics so that i will be able to answer any ${topic} questions under this topic,
        give the 25 subtopics as a python list

        ensure it is a valid json:

        Format:
        List[{"subtopic": subtopic1}]`]);
    return result.response.text();
}

async function getValidTopics(topic) {
    var topicsText = await getTopics(topic);

    try {
        var start = topicsText.indexOf("[");
        var end = topicsText.lastIndexOf("]");
        topicsText = topicsText.substring(start, end+1);
        const topicsListJson = JSON.parse(topicsText);
        
        if(!topicsListJson.some(topic => topic.hasOwnProperty("subtopic"))){
            throw new Error("topicsListJson does not contain subtopic");
        }     
        return topicsListJson
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(error);
        return await getValidTopics(topic);
    }
}

const genAI = new GoogleGenerativeAI("AIzaSyB6cPDFKr1kZqMsWa9pg3BRAcFSzUJk_pM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export default getValidTopics