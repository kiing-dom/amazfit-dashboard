import express, { type Request, type Response } from 'express';
import http from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss: WebSocketServer = new WebSocketServer({ server });

let latestData = {}

// WebSocket connecttion
wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");

    // send data
    ws.send(JSON.stringify(latestData))
});

function broadcast(data: Record<string, any>) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    })
}

app.post("/health", (req: Request, res: Response) => {
    latestData = req.body ?? {}
    console.log("Received:", latestData)

    broadcast(latestData)

    res.sendStatus(200)
});

app.get("/", (req: Request, res: Response) => {
    res.send("Server running!")
});

server.listen(3000, () => {
    console.log("Server running on port :3000")
})