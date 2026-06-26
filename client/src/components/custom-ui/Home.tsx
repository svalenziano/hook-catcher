import { useEffect, useState } from "react"
import { env } from "@/config/env"
import { NewBinCreator } from "./NewBinCreator"
import { CreateBinResultModal } from "./CreateBinResultModal"
import type { CreateBinResult } from "./CreateBinResultModal"
import { BinList } from "./BinList"
import NavBar from "./NavBar"
import {
  BinApiResponseSchema,
  PersistedBinsSchema,
  type PersistedBin,
} from "./schema"

export function Home() {
  const [bins, setBins] = useState<PersistedBin[]>([])
  const [createResult, setCreateResult] = useState<CreateBinResult | null>(null)

  useEffect(() => {
    async function fetchBins() {
      try {
        const response = await fetch(env.API_BINS, { cache: "no-store" })

        if (!response.ok) {
          throw new Error("Fetch bins request failed")
        }

        const data = await response.json()
        const parsedBins = PersistedBinsSchema.parse(data)
        setBins(
          [...parsedBins].sort(
            (a, b) => b.created_at.getTime() - a.created_at.getTime()
          )
        )
      } catch (err) {
        console.error(err)
      }
    }

    fetchBins()
  }, [])

  const onCreateBin = async () => {
    try {
      const response = await fetch(env.API_BINS, { method: "POST" })

      if (!response.ok) {
        throw new Error("Create bin request failed")
      }

      const data = await response.json()
      const createBinResponse = BinApiResponseSchema.parse(data)
      const createdBin = createBinResponse.bin

      setBins((currentBins) => [createdBin, ...currentBins])
      setCreateResult({ status: "success", bin: createdBin })
    } catch (err) {
      setCreateResult({ status: "error" })
    }
  }

  return (
    <>
      <NavBar />
      <NewBinCreator onCreateBin={onCreateBin} />
      <BinList bins={bins} />
      <CreateBinResultModal
        result={createResult}
        onClose={() => setCreateResult(null)}
      />
    </>
  )
}

export default Home
