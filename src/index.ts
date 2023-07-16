import bodyParser from "body-parser";
import express from "express";
import { JsonDB, Config } from "node-json-db";
import md5 from "md5";

const port = process.env.PORT || 3030
const app = express()

const jsonDB = new JsonDB(new Config("plans", true, true, '/'))

interface PlanItem {
    planid: number,
    name: string,
    duration: string
}

interface Plan {
    title: string,
    plans: PlanItem[]
}

app.use(bodyParser.json())
app.use(express.static("./public"))

app.post("/plan", (req, res) => {
    const plans = req.body.plans;
    const hash = md5(JSON.stringify(plans))
    console.log(hash, req.body)
    jsonDB.push("/"+hash, req.body)
    res.send({id: hash});
})

app.get("/plans", async (req, res) => {
    const data = await jsonDB.getData("/")
    res.send(data);
})

app.post("/plan/:id", (req, res) => {
    console.log(req.body)
    jsonDB.push("/"+req.params.id, req.body)
    res.send({id: req.params.id});
})

app.get("/plan/:id", async (req, res) => {
    console.log(req.body)
    const obj = await jsonDB.getObject<Plan>("/"+req.params.id)
    res.send(obj);
})

app.delete("/plan/:id", async (req, res) => {
    console.log(req.body)
    try {
        await jsonDB.delete("/"+req.params.id)
        res.send({id: req.params.id});
    } catch (e) {
        res.status(500).send(e)
    }
})

app.listen(port, () => {
    console.log("Started... on port " + port)
})