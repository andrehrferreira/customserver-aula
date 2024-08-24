import { ByteBuffer } from "./bytebuffer";
import { ConcurrentByteBufferPool } from "./concurrentpool";

export class Socket {
    public id: string;
    public originalSocket?: any;
    public sendCb: Function;

    constructor(id: string, originalSocket: any, sendCb: Function){
        this.id = id;
        this.originalSocket = originalSocket;
        this.sendCb = sendCb;
    }
    
    send(buffer: ByteBuffer) {
        this.sendCb(buffer.getBuffer());
        ConcurrentByteBufferPool.release(buffer);
    }

    sendBuffer(buffer: Uint8Array) {
        this.sendCb(buffer);
    }
}