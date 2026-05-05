import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { env } from "@/config/env"
import { Link } from "react-router-dom"
import CopyButton from "./Button_Copy"
import type { PersistedBin } from "./schema"

export type CreateBinResult =
  | { status: "success"; bin: PersistedBin }
  | { status: "error" }

type CreateBinResultModalProps = {
  result: CreateBinResult | null
  onClose: () => void
}

export function CreateBinResultModal({
  result,
  onClose,
}: CreateBinResultModalProps) {
  if (!result) {
    return null
  }

  const isSuccess = result.status === "success"
  const binId = isSuccess ? result.bin.id : ""
  const title = isSuccess ? "Created" : "Failed to Create Bin"
  const sendUrl = binId ? `/${binId}` : null
  const inspectUrl = binId ? env.VITE_APP_URL + "/bins/" + binId : null
  const webhookUrl = sendUrl ? env.API_WEBHOOK + "/" + binId : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 sm:px-6 sm:py-12"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
      />
      <Card
        className="relative z-10 w-full max-w-3xl gap-0 overflow-hidden rounded-md border border-border bg-card py-0 text-card-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader
          className={`grid-cols-[1fr_auto] items-center rounded-none px-4 py-3 sm:px-5 ${
            isSuccess ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <h2 className="text-2xl font-medium">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md text-white/80 hover:bg-white/10 hover:text-white"
          >
            ×
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 px-5 py-6 text-lg">
          {isSuccess ? (
            <>
              <p>Bin "{result.bin.id}" is successfully created!</p>
              <p>
                Your API URL is:{" "}
                <span className="inline-flex items-center gap-1 rounded-sm bg-amber-200 px-1 text-black">
                  <span>{webhookUrl}</span>
                  {webhookUrl && (
                    <CopyButton
                      content={webhookUrl}
                      className="h-7 w-7 text-black hover:bg-black/10"
                    />
                  )}
                </span>
              </p>
            </>
          ) : (
            <p>Failed to create a bin.</p>
          )}
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-transparent px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {isSuccess && (
            <Button type="button" asChild>
              <Link to={inspectUrl ?? "/"}>Open Bin</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
