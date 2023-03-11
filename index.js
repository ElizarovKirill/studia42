import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
	res.send("Ok");
});

app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => console.log(`Listening on ${port}`));

export default app;
