import express, { Application } from "express"
import { startDatabase } from "./database"
import { createDeveloper, createInfoDevelopers, listAllDevelopers, listOneDevelopers } from  "./logics/functions"
import { ensureDeveloperExist } from "./middlewares/middlewares"
const app: Application = express()
app.use(express.json())

app.post("/developers", createDeveloper)
app.post("/developers/:id/infos",ensureDeveloperExist,createInfoDevelopers)
app.get("/developers", listAllDevelopers)
app.get("/developers/:id",ensureDeveloperExist,listOneDevelopers)

app.listen(3000,async () => {
    console.log("Server is running")
    await startDatabase()
})