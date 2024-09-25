import { GoogleGenerativeAI } from "@google/generative-ai";
async function gemini_call(){

    const genAI = new GoogleGenerativeAI("AIzaSyB6cPDFKr1kZqMsWa9pg3BRAcFSzUJk_pM");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "give me 5 neet questions";

    const result = await model.generateContent([prompt]);
    console.log(result.response.text());

    return result.response.text();
}

export default gemini_call