import { ByteBuffer } from "./bytebuffer";

export class ByteBufferPool {
    private head: ByteBuffer | null = null;

    private tail: ByteBuffer | null = null;

    public add(buffer: ByteBuffer): void {
        buffer.next = this.head;

        if (!this.tail) 
            this.tail = buffer;
        
        this.head = buffer;
    }

    public clear(): ByteBuffer | null {
        const result = this.head;

        this.head = null;
        this.tail = null;

        return result;
    }

    public take(): ByteBuffer | null {
        if (!this.head) 
            return null;
        
        const result = this.head;

        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
        }

        result.next = null; 

        return result;
    }

    public merge(other: ByteBufferPool): void {
        if (!this.head) {
            this.head = other.head;
            this.tail = other.tail;
        } else if (other.head) {
            this.tail!.next = other.head;
            this.tail = other.tail;
        }

        other.head = null;
        other.tail = null;
    }

    public get length(): number {
        let count = 0;
        let current = this.head;

        while (current) {
            current = current.next;
            count++;
        }

        return count;
    }
}