import express from "express";
import cors from 'cors';
import questionRouter from "./routes/router.js";
import { topicsRouter } from "./routes/router.js";

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());
app.use('/get-question', questionRouter);
app.use('/get-topics', topicsRouter);

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