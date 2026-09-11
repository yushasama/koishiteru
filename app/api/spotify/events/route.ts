import { spotifyPlaybackMonitor, type PlaybackStatus } from '../playback'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
export const runtime = 'nodejs'

const encoder = new TextEncoder()

function eventPayload(status: PlaybackStatus): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(status)}\n\n`)
}

export async function GET(request: Request): Promise<Response> {
  let close = (): void => undefined
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const unsubscribe = spotifyPlaybackMonitor.subscribe((status) => controller.enqueue(eventPayload(status)))
      const heartbeat = setInterval(() => controller.enqueue(encoder.encode(': heartbeat\n\n')), 15_000)
      const lifetime = setTimeout(() => close(), 55_000)
      close = () => {
        clearInterval(heartbeat)
        clearTimeout(lifetime)
        unsubscribe()
        request.signal.removeEventListener('abort', close)
        try {
          controller.close()
        } catch {
          // The browser may have already closed the stream.
        }
      }
      request.signal.addEventListener('abort', close, { once: true })
      controller.enqueue(encoder.encode('retry: 5000\n\n'))
    },
    cancel() {
      close()
    },
  })
  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  })
}
