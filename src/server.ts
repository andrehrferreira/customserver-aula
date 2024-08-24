import * as WebSocket from "ws";
import { v4 as uuidv4 } from 'uuid';
import { ByteBuffer } from "./lib/bytebuffer";
import { ConcurrentByteBufferPool } from "./lib/concurrentpool";

const port = 3001;
const clients = new Map<string, any>();
const server = new WebSocket.Server({ port, host: "0.0.0.0" });

server.on('connection', (socket) => {
    const id = uuidv4();
    sendPacket(socket, packetSession(id));
    clients.set(id, socket);

    console.log(`Player connected ${id}`);

    socket.on('message', (data) => {
        const message = new ByteBuffer(ByteBuffer.toArrayBuffer(data));
        const encrypted = message.getByte();
        const type = message.getByte();

        switch(type){
            case 0: //Move
                const sessionId = message.getString();
                const x = message.getInt32();
                const y = message.getInt32();
                const z = message.getInt32();

                if(sessionId)
                    broadcast(packetMove(sessionId, { x, y, z }), id);                
            break;
        }
    });

    socket.on('close', () => {
        clients.delete(id);
        console.log(`Player disconnected ${id}`);
    });

    broadcast(packetCreatePlayer(id), id);
});

function sendPacket(socket: any, packet: ByteBuffer){
    socket.send(packet.getBuffer());
    ConcurrentByteBufferPool.release(packet);
}

function broadcast(message: ByteBuffer, id: string){
    clients.forEach((client, idSocket) => {
        if(idSocket !== id)
            client.send(message.getBuffer());
    });

    ConcurrentByteBufferPool.release(message);
}

function packetSession(id: string) : ByteBuffer {
    let buffer = ConcurrentByteBufferPool.acquire();
    buffer.putByte(0);
    buffer.putString(id);
    return buffer;
}

function packetCreatePlayer(id: string){
    let buffer = ConcurrentByteBufferPool.acquire();
    buffer.putByte(1);
    buffer.putString(id);
    return buffer;
}

function packetMove(id: string, positon: { x: number, y: number, z: number }){
    let buffer = ConcurrentByteBufferPool.acquire();
    buffer.putByte(2);
    buffer.putString(id);
    buffer.putInt32(positon.x);
    buffer.putInt32(positon.y);
    buffer.putInt32(positon.z);
    return buffer;
}

console.log(`Server Listem ${port}`);