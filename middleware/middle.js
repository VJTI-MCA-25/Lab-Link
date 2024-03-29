import express from "express";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";

// Socket.io imports
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

const PCList = {
	PC1: "http://172.18.36.181:3001", // LAN
	PC2: "http://172.18.36.229:3001", // LAN
	PC3: "http://localhost:3001", // local
	// "http://192.168.56.102:3001", // VM
	// "https://test.loca.lt", // localtunnel
};

const urls = Object.values(PCList);
const names = Object.keys(PCList);

async function sendRequests(urls, config) {
	let returnData = [];
	let requests = urls.map((url) =>
		axios({
			...config,
			url: url + config.type,
			port: 3001,
			timeout: 3000,
		})
	);
	let results = await Promise.allSettled(requests);
	results.forEach((res, index) => {
		if (res.status === "fulfilled") {
			returnData.push({ id: names[index], data: res.value.data });
		} else {
			returnData.push({
				id: names[index],
				status: "failed",
				reason: res.reason.code,
				url: res.reason.config.url,
			});
		}
	});
	return returnData;
}

const adminIo = io.of("/admin");

adminIo.on("connection", (socket) => {
	console.log("Admin Connected =>", socket.id);

	socket.on("shutdown", async (id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, { method: "get", type: "/shutdown" });
		callback(data);
	});

	socket.on("reboot", async (id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, { method: "get", type: "/reboot" });
		callback(data);
	});

	socket.on("search", async (applicationName, id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, {
			method: "get",
			type: "/search",
			params: { name: applicationName },
		});
		callback(data);
	});

	socket.on("info", async (id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, { method: "get", type: "/info" });
		callback(data);
	});

	socket.on("applications", async (id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, { method: "get", type: "/applications" });
		callback(data);
	});

	socket.on("peripherals", async (id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, { method: "get", type: "/peripherals" });
		callback(data);
	});

	socket.on("installed-from-list", async (applications, id, callback) => {
		const data = await sendRequests(id ? [PCList[id]] : urls, {
			method: "get",
			type: "/installed_from_list",
			data: applications.join(","),
		});
		callback(data);
	});

	socket.on("all-data", async (id, applications, callback) => {
		const info = await sendRequests([PCList[id]], { method: "get", type: "/info" });
		const installed_apps = await sendRequests([PCList[id]], {
			method: "get",
			type: "/installed_from_list",
			data: applications.join(","),
		});
		const peripherals = await sendRequests([PCList[id]], { method: "get", type: "/peripherals" });
		const data = { info: info[0].data, applications: installed_apps[0].data, peripherals: peripherals[0].data };
		callback(data);
	});
});

//? Should be used when testing with VM
// app.listen(3000, "192.168.56.101", () => {
// 	console.log("Listening on port 3000...");
// });

server.listen(3000, "172.18.36.201", () => {
	console.log("Listening on port 3000...");
});

// server.listen(3000, "172.18.36.201", () => {
// 	console.log("Listening on port 3000...");
// });
