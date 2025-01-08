
import { Router } from "express";
import { RedisManager } from "../RedisManager";

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {  
    
    const response = RedisManager.getInstance().sendAndAwait
    res.json({});
});