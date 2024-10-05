import { GoogleGenerativeAI } from "@google/generative-ai";


async function getTopics(topic) {

    const i = Math.floor(Math.random() * 5) + 1;
    const result =await models[i].generateContent([`Task:

        i want to learn ${topic},
        create 15 subtopics so that i will be able to answer any ${topic} questions under this topic,
        give the 15 subtopics as a python list

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

const API_KEYs = [
    "AIzaSyC6F0-bUwVhQt-19g2yIru70SnPjgK8aPE",
    "AIzaSyCgGCS5PuH_cP8UULH3598NmLZc8weFX2I",
    "AIzaSyDQm3qK6cnTuhi381GtwaRPAnQIg5TfWyg",
    "AIzaSyB6cPDFKr1kZqMsWa9pg3BRAcFSzUJk_pM",
    "AIzaSyA6sj3Nu0xa_ZvqkaE__i2tafTRcZcI3Eg"
]
var models = []
var genAIs = []
for(let i = 0; i < API_KEYs.length; i++)
{
    const genAI = new GoogleGenerativeAI(API_KEYs[i]);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    models.push(model);
    genAIs.push(genAI);
}

export default getValidTopics