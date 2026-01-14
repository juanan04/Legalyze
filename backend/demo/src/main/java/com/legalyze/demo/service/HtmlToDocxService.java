package com.legalyze.demo.service;

import org.docx4j.convert.in.xhtml.XHTMLImporterImpl;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Service
public class HtmlToDocxService {

    public byte[] convert(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            // Create a new Word package
            WordprocessingMLPackage wordMLPackage = WordprocessingMLPackage.createPackage();

            // Configure the importer
            XHTMLImporterImpl importer = new XHTMLImporterImpl(wordMLPackage);

            // Clean and convert to XHTML using Jsoup
            Document document = Jsoup.parse(html);
            document.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
            String xhtml = document.html();

            // Convert HTML to DOCX
            wordMLPackage.getMainDocumentPart().getContent().addAll(
                    importer.convert(xhtml, null));

            // Save to stream
            wordMLPackage.save(os);

            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Word document", e);
        }
    }
}
