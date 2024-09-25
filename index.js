import express from "express";
import quiz_router from "./routes/question_router.js";

const app = express();

const PORT = 3000;

app.use(express.json());
app.use('/get-question', quiz_router);

app.get('/', (req, res)=>{
    res.status(200);
    res.send("Welcome root URL of Server");
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);