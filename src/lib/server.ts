import { ByteBuffer } from "./bytebuffer";
import { ConcurrentByteBufferPool } from "./concurrentpool";
import { IConn } from "./conn.interface";
import { Socket } from "./socket";

export class Server {
    protected clients: Map<string, Socket> = new Map<string, Socket>();

    constructor(private adapter: new () => IConn){ }

    hasSocket(id: string) : boolean {
        return this.clients.has(id);
    }

    getSocket(id: string) : Socket | null | undefined {
        return (this.clients.has(id)) ? this.clients.get(id) : null;
    }

    onlineSockets(): number {
        return this.clients.values.length;
    }

    broadcast(message: ByteBuffer) : void {
        let buffer = message.getBuffer();
        this.clients.forEach((socket) => socket.sendBuffer(buffer));
        ConcurrentByteBufferPool.release(message);
    }

    listen(host: string, port: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let adapterInstance = new this.adapter();

            adapterInstance.onConnection((socket: Socket) => {                
                this.clients.set(socket.id, socket);
                console.log(`Client ${socket.id} has been connected`);
            });

            adapterInstance.onConnect(resolve);
            adapterInstance.onError(reject);
            adapterInstance.listen(host, port);
        });        
    }
}