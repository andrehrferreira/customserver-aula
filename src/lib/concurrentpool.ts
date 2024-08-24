import { ByteBuffer } from "./bytebuffer";
import { ByteBufferPool } from "./bytebufferpool";

export class ConcurrentByteBufferPool {
    private static global = new ByteBufferPool();
    private static local: ByteBufferPool | null = null;

    public static acquire(): ByteBuffer {
        let buffer: ByteBuffer | null;

        if (!ConcurrentByteBufferPool.local) {
            buffer = ConcurrentByteBufferPool.takeFromGlobal();
        } else {
            buffer = ConcurrentByteBufferPool.local.take();

            if (!buffer) 
                buffer = ConcurrentByteBufferPool.takeFromGlobal();            
        }

        return buffer || new ByteBuffer();
    }

    public static release(buffer: ByteBuffer): void {
        if (!ConcurrentByteBufferPool.local) 
            ConcurrentByteBufferPool.local = new ByteBufferPool();
        
        buffer.reset();
        ConcurrentByteBufferPool.local.add(buffer);
    }

    public static merge(): void {
        if (ConcurrentByteBufferPool.local && ConcurrentByteBufferPool.local.length > 0) 
            ConcurrentByteBufferPool.global.merge(ConcurrentByteBufferPool.local);
    }

    public static clear(): ByteBuffer | null {
        return ConcurrentByteBufferPool.global.clear();
    }

    private static takeFromGlobal(): ByteBuffer | null {
        let buffer: ByteBuffer | null;
        buffer = ConcurrentByteBufferPool.global.take();
        return buffer;
    }
}