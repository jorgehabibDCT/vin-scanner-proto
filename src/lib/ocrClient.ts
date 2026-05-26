import Tesseract from "tesseract.js";
import { extractBestVin } from "./vinExtraction";
import { buildVinScanResult } from "./vinValidation";

export type OcrEngine = "tesseract" | "mock" | "cloud";

export type OcrScanOptions = {
  engine?: OcrEngine;
};

let tesseractWorker: Tesseract.Worker | null = null;

async function getTesseractWorker(): Promise<Tesseract.Worker> {
  if (!tesseractWorker) {
    tesseractWorker = await Tesseract.createWorker("eng", 1, {
      logger: () => {},
    });
    await tesseractWorker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHJKLMNPRSTUVWXYZ0123456789",
    });
  }
  return tesseractWorker;
}

/**
 * Primary OCR path: Tesseract.js on a canvas/image source.
 * Swap implementation here for cloud OCR (Google Vision, AWS Textract, etc.).
 */
export async function runOcrOnImage(
  image: HTMLCanvasElement | HTMLImageElement | ImageData,
  options: OcrScanOptions = {},
): Promise<import("../types/vin").VinScanResult> {
  const engine = options.engine ?? "tesseract";

  if (engine === "mock") {
    return runMockOcr();
  }

  if (engine === "cloud") {
    // TODO: POST image to cloud OCR endpoint (env: VITE_OCR_API_URL)
    throw new Error("Cloud OCR is not configured for this prototype.");
  }

  try {
    const worker = await getTesseractWorker();
    const { data } = await worker.recognize(image);
    const rawText = data.text ?? "";
    const confidence = data.confidence;
    const candidate = extractBestVin(rawText);
    return buildVinScanResult(rawText, candidate, "ocr", confidence);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed";
    throw new Error(`OCR failed: ${message}`, { cause: err });
  }
}

/** Dev/demo fallback when camera OCR is unavailable. */
export async function runMockOcr(
  sampleVin = "1HGBH41JXMN109186",
): Promise<import("../types/vin").VinScanResult> {
  await new Promise((r) => setTimeout(r, 400));
  return buildVinScanResult(
    `MOCK OCR: ${sampleVin}`,
    sampleVin,
    "mock",
    0.85,
  );
}

export async function terminateOcrWorker(): Promise<void> {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}
