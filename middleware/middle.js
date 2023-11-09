const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/info", async (req, res) => {
	var result = await axios({
		method: "get",
		// url: "http://localhost:3001/info",
		url: "http://test.loca.lt/info",
	});
	res.setHeader("Content-Type", "application/json");
	res.send(JSON.stringify(result.data));
});

app.post("/shutdown", async (req, res) => {
	await axios({
		method: "post",
		// url: "http://localhost:3001/shutdown",
		url: "http://test.loca.lt/shutdown",
	});
});

app.listen(3000, () => {
	console.log("Listening on port 3000...");
});