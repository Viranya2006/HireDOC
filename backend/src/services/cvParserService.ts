import pdfParse from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch {
    throw new Error("Failed to parse PDF. Ensure the file is a valid PDF.");
  }
}
