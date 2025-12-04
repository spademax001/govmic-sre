import { PDFDocument, StandardFonts } from "pdf-lib";
import MarkdownIt from "markdown-it";

export default async function handler(req, res) {
  try {
    const { filename = "output.pdf", content = "" } = req.body;

    const md = new MarkdownIt();
    const html = md.render(content);
    const text = html.replace(/<[^>]+>/g, "");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // letter size
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = height - 50;

    // Header
    page.drawText("THE REPORT: Solicitation Summary", {
      x: 50,
      y,
      size: 14,
      font
    });

    y -= 40;

    // Body text
    for (const line of text.split("\n")) {
      if (y < 50) {
        page = pdfDoc.addPage([612, 792]);
        y = height - 50;
      }
      page.drawText(line, { x: 50, y, size: 10, font });
      y -= 14;
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
