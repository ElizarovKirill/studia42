import { bot } from "./api/webhook.js";
import express from "express";

const app = express();

const port = process.env.PORT || 3000;
// const route = "/api/webhook";

app.get("/", (req, res) => {
	res.send("Ok");
});

// app.get("/secret-path", (req, res) => {
// 	bot.handleUpdate(req.body, res);
// 	res.send("Ok");
// });

app.use(express.static("public"));
app.use(express.json());

// bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}${route}`);
// app.use(bot.webhookCallback(route));

bot.launch();

app.listen(port, () => console.log(`Listening on ${port}`));

export default app;
