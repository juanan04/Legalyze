package com.legalyze.demo.service;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Service
public class HtmlToPdfService {

    public byte[] render(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            // Ensure we have a valid HTML structure with professional styles
            if (!html.toLowerCase().contains("<html>")) {
                String css = "body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }"
                        +
                        "h1 { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 24px; }"
                        +
                        "h2 { font-size: 13pt; font-weight: bold; margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }"
                        +
                        "h3 { font-size: 11pt; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }" +
                        "p { text-align: justify; margin-bottom: 10px; }" +
                        "ul, ol { margin-bottom: 10px; padding-left: 20px; }" +
                        "li { margin-bottom: 4px; text-align: justify; }" +
                        ".signature-box { margin-top: 50px; display: flex; justify-content: space-between; }" +
                        ".signature-line { border-top: 1px solid #000; width: 40%; margin-top: 40px; text-align: center; font-size: 10pt; }";

                html = "<html><head><style>" + css + "</style></head><body>" + html + "</body></html>";
            }

            // Clean and convert to valid XHTML using Jsoup
            Document doc = Jsoup.parse(html);
            doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
            String xhtml = doc.html();

            builder.withHtmlContent(xhtml, "");
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
