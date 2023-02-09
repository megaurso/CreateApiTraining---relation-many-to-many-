import express, { Application } from "express"
import { startDatabase } from "./database"
import { createDeveloper, createInfoDevelopers, deleteDevelopers, listAllDevelopers, listOneDevelopers, updateDevelopers, updateInfoDevelopers } from  "./logics/developers"
import { ensureDeveloperExist, ensureProjectExist } from "./middlewares/middlewares"
import { createProject, deleteProject, listAllProjects, listOneProject, updateProjects } from "./logics/projects"
const app: Application = express()
app.use(express.json())

app.post("/developers", createDeveloper)
app.post("/developers/:id/infos",ensureDeveloperExist,createInfoDevelopers)
app.get("/developers", listAllDevelopers)
app.get("/developers/:id",ensureDeveloperExist,listOneDevelopers)
app.patch("/developers/:id",ensureDeveloperExist,updateDevelopers)
app.patch("/developers/:id/infos",updateInfoDevelopers)
app.delete("/developers/:id",ensureDeveloperExist,deleteDevelopers)

app.post("/projects",createProject)
app.get("/projects",listAllProjects)
app.get("/projects/:id",ensureProjectExist,listOneProject)
app.patch("/projects/:id",ensureProjectExist,updateProjects)
app.delete("/projects/:id",ensureProjectExist,deleteProject)


app.listen(3000,async () => {
    console.log("Server is running")
    await startDatabase()
})