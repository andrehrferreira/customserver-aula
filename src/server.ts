import * as WebSocket from "ws";
import { v4 as uuidv4 } from 'uuid';

const port = 3001;
const clients = new Map<string, any>();
const server = new WebSocket.Server({ port });

server.on('connection', (socket) => {
    const id = uuidv4();
    socket.send(JSON.stringify({ type: "Session", id }));
    clients.set(id, socket);

    console.log(`Player connected ${id}`);

    socket.on('message', (message) => {
        const [sessionId, position] = message.toString('utf-8').split(",");

        console.log(sessionId);

        if(sessionId)
            broadcast({ type: "Move", id: sessionId, position: position }, id);
        //console.log(`${id}: ${message.toString('utf-8')}`);
    });

    socket.on('close', () => {
        clients.delete(id);
        console.log(`Player disconnected ${id}`);
    });

    broadcast({ type: "CreatePlayer", id: id }, id);
});

function broadcast(message: any, id: string){
    clients.forEach((client, idSocket) => {
        if(idSocket !== id)
            client.send(JSON.stringify(message));
    })
}

console.log(`Server Listem ${port}`);