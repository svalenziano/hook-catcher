import { env } from "@/config/env"
import { PersistedBinsSchema } from "@/components/custom-ui/schema"
import { BinWithRequestsSchema } from "@/types/request"

export async function getAllBins() {
  const response = await fetch(`${env.API_BINS}`)
  const data = await response.json()
  return PersistedBinsSchema.parse(data)
}

export async function getBin(id: string) {
  const response = await fetch(`${env.API_BINS}/${id}`)
  const data = await response.json()
  return BinWithRequestsSchema.parse(data)
}

export async function deleteBin(id: string) {
  const response = await fetch(`${env.API_BINS}/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`Deletion of bin ${id} was unsuccessful.`)
  }
}
