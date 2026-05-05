import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Clock,
  CalendarDays,
  RefreshCwIcon,
  RotateCwIcon,
  Shredder,
  Trash,
  Trash2,
  CircleSlash2,
} from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import NavBar from "@/components/custom-ui/NavBar.tsx"
import CopyButton from "@/components/custom-ui/Button_Copy.tsx"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner.tsx"

import { useParams, useNavigate } from "react-router"
import { env } from "@/config/env"
import * as binService from "./fetch_bins.ts"
import React, { useEffect, useState } from "react"
import type { BinWithRequests, RequestDocument } from "@/types/request.ts"
import { toast } from "sonner"
import useBinWebSocket from "@/hooks/useBinWebSocket.ts"

export default function BinView() {
  const [bin, setBin] = useState<BinWithRequests | null>(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const nav = useNavigate()

  async function getBin(id: string) {
    setBin(await binService.getBin(id))
    setLoading(false)
  }

  async function deleteBin(id: string | undefined) {
    if (!id) return
    await binService.deleteBin(id)
    nav("/")
    toast.success(`Bin ${id} has been deleted`)
  }

  async function refreshBin() {
    if (!id) return
    setLoading(true)
    await getBin(id)
  }

  useEffect(() => {
    if (!id) return

    let isSubscribed = true

    async function loadBin() {
      const nextBin = await binService.getBin(id as string)

      if (isSubscribed) {
        setBin(nextBin)
        setLoading(false)
      }
    }

    loadBin()

    return () => {
      isSubscribed = false
    }
  }, [id])

  useBinWebSocket({
    binId: id,
    onNewRequest: (request) => {
      setBin((currentBin) => {
        if (!currentBin) return currentBin

        return {
          ...currentBin,
          requests: [request, ...currentBin.requests],
        }
      })
    },
  })

  return (
    <div>
      <NavBar>
        <BasketEditButtonBar
          deleteBinCB={() => deleteBin(id)}
          refresh={refreshBin}
        />
      </NavBar>
      <BasketInfoHeader bin={bin} />
      {loading ? (
        <Spinner className="mx-auto size-14 min-h-150" />
      ) : (
        <RequestList requests={bin && bin.requests} />
      )}
    </div>
  )
}

function BasketInfoHeader({ bin }: { bin: BinWithRequests | null }) {
  const basketUrl = env.API_WEBHOOK + "/" + (bin && bin.bin.id)

  return (
    <section className="mx-auto max-w-4xl p-3">
      <h1 className="text-2xl font-bold">Bin: {bin && bin.bin.id}</h1>
      <p>
        Send webhooks to: {basketUrl}
        {basketUrl && <CopyButton content={basketUrl} />}
      </p>
      <p>Request Count: {bin && bin.requests.length}</p>
    </section>
  )
}

function RequestList({ requests }: { requests: RequestDocument[] | null }) {
  if (!requests || requests.length === 0) return <EmptyRequestList />
  console.log(requests)

  return (
    <section className="mx-auto grid max-w-4xl grid-cols-[repeat(auto-fill,minmax(28rem,1fr))] items-start">
      {requests &&
        requests.map((req: RequestDocument) => {
          return <RequestDetails key={req._id} request={req} />
        })}
    </section>
  )
}

function EmptyRequestList() {
  return (
    <div className="flex h-full min-h-150 items-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleSlash2 />
          </EmptyMedia>
          <EmptyTitle>No data</EmptyTitle>
          <EmptyDescription>
            Send a request to the above URL and your request will appear here!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

function RequestDetails({ request }: { request: RequestDocument }) {
  return (
    <section>
      <Card className="m-4 max-w-md">
        <CardHeader>
          <CardTitle>{request.method}</CardTitle>
          <TimeStamp dateTime={request.received_at} />
          <DateStamp received={request.received_at} />
        </CardHeader>
        <CardContent>
          <RequestPath path={request.path} />
          <RequestHeadersAndBody request={request} />
        </CardContent>
      </Card>
    </section>
  )
}

function RequestHeadersAndBody({ request }: { request: RequestDocument }) {
  const readableHeaders = Object.entries(request.headers).map((entry) => {
    const [header, value] = entry
    return <div className="m-0" key={header}>{`${header}: ${value}`}</div>
  })

  return (
    <Accordion type="single" collapsible defaultValue="">
      <AccordionItem value="item-1">
        <AccordionTrigger>Headers</AccordionTrigger>
        <AccordionContent>
          <SimpleCodeBlock>{readableHeaders}</SimpleCodeBlock>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Body</AccordionTrigger>
        <AccordionContent>
          <SimpleCodeBlock
            content={JSON.stringify(JSON.parse(request.body), null, 2)}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

type SimpleCodeBlockProps = {
  content?: string
  copyButtonVisible?: boolean
  children?: React.ReactNode
}

function SimpleCodeBlock({
  content,
  copyButtonVisible = true,
  children,
}: SimpleCodeBlockProps) {
  return (
    <Item className="bg-secondary">
      <ItemContent>
        {content && <pre>{content}</pre>}
        {children}
      </ItemContent>
      {copyButtonVisible && (content || children) && (
        <CopyButton content={content || null} />
      )}
    </Item>
  )
}

function RequestPath({ path }: { path: string }) {
  return (
    <Item className="bg-primary text-primary-foreground">
      <ItemContent>
        <p>{path}</p>
      </ItemContent>
      <CopyButton content={path} />
    </Item>
  )
}

function TimeStamp({ dateTime }: { dateTime: Date }) {
  return (
    <Item>
      <ItemMedia variant="icon">
        <Clock />
      </ItemMedia>
      <ItemContent>
        <time>{dateTime.toTimeString()}</time>
      </ItemContent>
    </Item>
  )
}

function DateStamp({ received }: { received: Date }) {
  return (
    <Item>
      <ItemMedia variant="icon">
        <CalendarDays />
      </ItemMedia>
      <ItemContent>
        <time>{received.toDateString()}</time>
      </ItemContent>
    </Item>
  )
}

function notYetImplemented(ev: React.MouseEvent) {
  ev.preventDefault()
  toast.error("Not yet implemented")
}

type BasketEditProps = {
  deleteBinCB: Function
  refresh: Function
}

function BasketEditButtonBar({ deleteBinCB, refresh }: BasketEditProps) {
  return (
    <ButtonGroup>
      <ButtonGroup className="flex">
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          title="Refresh"
          onClick={() => refresh()}
        >
          <RefreshCwIcon />
        </Button>
        <Button
          variant="default"
          size="icon"
          aria-label="Auto-refresh"
          title="Auto-refresh"
          onClick={notYetImplemented}
        >
          <RotateCwIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              aria-label="More Options"
              title="Deletion Menu"
            >
              <Trash />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={notYetImplemented}>
                <Shredder />
                Delete all requests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteBinCB()}>
                <Trash2 />
                Destroy basket
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}
