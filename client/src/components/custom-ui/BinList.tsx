import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Link } from "react-router-dom"
import type { PersistedBin } from "./schema"
import { env } from "@/config/env.ts"

type BinListProps = {
  bins: PersistedBin[]
}

export function BinList({ bins }: BinListProps) {
  return (
    <section className="w-full px-4 pb-8 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-5xl rounded-[2rem] border bg-card shadow-sm">
        <CardHeader className="px-6 pt-8 pb-3 sm:px-10">
          <h2 className="text-2xl font-semibold tracking-tight">Bins</h2>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:px-10">
          {bins.length === 0 ? (
            <p className="text-muted-foreground">No bins yet.</p>
          ) : (
            <ul className="space-y-3">
              {bins.map((bin) => {
                const inspectUrl = `/bins/${bin.id}`
                const fullInspectUrl = `${env.VITE_APP_URL}/bins/${bin.id}`
                const createdDate = bin.created_at.toLocaleDateString()
                const expiresDate = bin.expires_at.toLocaleDateString()

                return (
                  <li
                    key={bin.id}
                    className="rounded-xl border bg-background px-4 py-3"
                  >
                    <p className="font-medium">{bin.id}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span>
                        <span className="font-semibold text-foreground">
                          Created:
                        </span>{" "}
                        {createdDate}
                      </span>
                      <span>
                        <span className="font-semibold text-foreground">
                          Invalidates:
                        </span>{" "}
                        {expiresDate}
                      </span>
                      <span>
                        <span className="font-semibold text-foreground">
                          View at:
                        </span>{" "}
                        <Link
                          to={inspectUrl}
                          className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                        >
                          {fullInspectUrl}
                        </Link>
                      </span>
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
