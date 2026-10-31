import type { Readable, Writable } from 'node:stream';

/** Chromium's debugging pipe frames JSON messages with a NUL byte. */
export class BrowserProtocol {
  private sequence = 0;
  private buffered = '';
  private failure?: Error;
  private readonly pending = new Map<
    number,
    { resolve: (result: Record<string, unknown>) => void; reject: (error: Error) => void }
  >();

  constructor(
    private readonly commands: Writable,
    responses: Readable,
  ) {
    responses.setEncoding('utf8');
    responses.on('data', (chunk: string) => this.receive(chunk));
    responses.on('end', () => this.close());
    responses.on('error', (error: Error) => this.close(error));
    commands.on('error', (error: Error) => this.close(error));
    commands.on('close', () => this.close());
  }

  send(method: string, params: Record<string, unknown> = {}, sessionId?: string): Promise<Record<string, unknown>> {
    if (this.failure) return Promise.reject(this.failure);
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try {
        this.commands.write(`${JSON.stringify({ id, method, params, sessionId })}\0`, (error) => {
          if (error) this.close(error);
        });
      } catch (error) {
        this.close(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  close(error = new Error('Browser connection closed')): void {
    this.failure ??= error;
    for (const request of this.pending.values()) request.reject(this.failure);
    this.pending.clear();
  }

  private receive(chunk: string): void {
    this.buffered += chunk;
    let boundary: number;
    while ((boundary = this.buffered.indexOf('\0')) !== -1) {
      const message = JSON.parse(this.buffered.slice(0, boundary)) as {
        id?: number;
        result?: Record<string, unknown>;
        error?: { message: string };
      };
      this.buffered = this.buffered.slice(boundary + 1);
      if (message.id === undefined) continue;
      const request = this.pending.get(message.id);
      if (!request) continue;
      this.pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result ?? {});
    }
  }
}
