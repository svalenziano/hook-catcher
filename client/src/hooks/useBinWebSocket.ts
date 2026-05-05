import { useEffect, useEffectEvent } from "react"
import { z } from "zod"

import { env } from "@/config/env"
import { RequestDocumentSchema, type RequestDocument } from "@/types/request"

const WebSocketRequestPayloadSchema = RequestDocumentSchema.omit({
  _id: true,
}).extend({
  _id: z.string().optional(),
})

const BinWebSocketMessageSchema = z.object({
  type: z.literal("new_request"),
  payload: WebSocketRequestPayloadSchema,
})

type UseBinWebSocketOptions = {
  binId?: string
  onNewRequest: (request: RequestDocument) => void
}

function getBinWebSocketUrl(binId: string): string {
  const ws = env.API_WEBSOCKET
  const protocol = ws.protocol === "https:" ? "wss:" : "ws:"
  const endpoint = `${protocol}//${ws.host}${ws.pathname}?binId=${encodeURIComponent(binId)}`
  return endpoint

}

function normalizeRequest(
  payload: z.infer<typeof WebSocketRequestPayloadSchema>
): RequestDocument {
  return RequestDocumentSchema.parse({
    ...payload,
    _id: payload._id ?? crypto.randomUUID(),
  })
}

export function useBinWebSocket({
  binId,
  onNewRequest,
}: UseBinWebSocketOptions) {
  const handleNewRequest = useEffectEvent(onNewRequest)

  useEffect(() => {
    if (!binId) return

    const webSocket = new WebSocket(getBinWebSocketUrl(binId))

    webSocket.onmessage = (event) => {
      try {
        const parsedMessage = BinWebSocketMessageSchema.parse(
          JSON.parse(event.data)
        )

        handleNewRequest(normalizeRequest(parsedMessage.payload))
      } catch (error) {
        console.error("Failed to process websocket message", error)
      }
    }

    webSocket.onclose = () => {
      console.info(`WebSocket disconnected for bin ${binId}`)
    }

    return () => {
      webSocket.close()
    }
  }, [binId])
}

export default useBinWebSocket
