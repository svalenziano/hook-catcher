import { config } from "@/env";
import { SpanStatusCode, trace, type Span } from "@opentelemetry/api";
import opentelemetry from "@opentelemetry/api";
import { Router, Request, Response } from "express";
import {
  createBin,
  getAllBins,
  getBinWithRequestDocuments,
  deleteBin,
} from "../services/binService";

const router = Router();

const tracer = opentelemetry.trace.getTracer(
  "binHandler",
  config.OTEL_INSTRUMENTATION_SCOPE_VERSION,
);

/**
 * POST /api/bins - Creates a new bin.
 * Calls the bin service to generate a unique bin ID, persist it to the database,
 * and return the bin details along with its send and inspect URLs.
 * @returns 201 - The created bin with sendUrl and inspectUrl.
 * @returns 500 - If bin creation fails.
 */
router.post("/", async (_req: Request, res: Response) => {
  return tracer.startActiveSpan("createBin", async (span: Span) => {
    try {
      const binResponse = await createBin();
      res.status(201).json(binResponse);
      span.setAttribute("app.createBin", "success");
    } catch (error) {
      console.error("Failed to create bin.", error);
      res.status(500).json({ error: "Failed to create bin." });
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Failed to create bin.",
      });
      span.setAttribute("app.createBin", "fail");
    } finally {
      span.end();
    }
  });
});

export default router;

router.get("/", async (_req: Request, res: Response) => {
  try {
    const bins = await getAllBins();
    res.status(200).json(bins);
  } catch (error) {
    console.log("Failed to fetch bins.", error);
    res.status(500).json({ error: "Failed to create bin." });
  }
});

router.get("/:binId", async (req: Request, res: Response) => {
  try {
    const id = req.params.binId as string;
    const binWithRequestDocuments = await getBinWithRequestDocuments(id);
    res.status(200).json(binWithRequestDocuments);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Bin not found.") {
        res.status(404).json({ error: "Bin not found." });
        return;
      }
      if (error.message === "Bin has expired.") {
        res.status(410).json({ error: "Bin has expired." });
        return;
      }
    }

    console.log("Failed to fetch bin.");
    res.status(500).json({ error: "Failed to fetch bin." });
  }
});

router.delete("/:binId", async (req: Request, res: Response) => {
  try {
    const id = req.params.binId as string;
    await deleteBin(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Bin not found.") {
        res.status(404).json({ error: "Bin not found." });
        return;
      }
    }

    console.log("Failed to delete bin.", error);
    res.status(500).json({ error: "Failed to delete bin." });
  }
});
