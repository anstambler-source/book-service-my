import {dbConnection} from "./config/database.js";
import dotenv from "dotenv";
import express from "express";
import {syncModels} from "./model/index.js";
import bookRouter from "./routes/book.routes.js";
import authorRouter from "./routes/author.routes.js";
import publisherRouter from "./routes/publisher.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(bookRouter)
app.use(authorRouter)
app.use(publisherRouter)

const startServer = async () => {
    await dbConnection();
    await syncModels();
    app.listen(process.env.PORT || 8080, () => {
        console.log(`Server is running on port ${process.env.PORT || 8080}`);
    })
}

startServer();