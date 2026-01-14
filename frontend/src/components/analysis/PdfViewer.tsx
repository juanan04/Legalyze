import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search } from 'lucide-react';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export const PdfViewer = ({ file, highlightData, targetPage }: { file: File | string, highlightData?: { text: string, timestamp: number }, targetPage?: number }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isSearching, setIsSearching] = useState(false);

    // Store which text items (by index) should be highlighted
    // Key: pageIndex_itemIndex (e.g. "1_45")
    const [highlightedIndices, setHighlightedIndices] = useState<Set<string>>(new Set());

    // Helper to normalize text (remove accents, case insensitive, punctuation)
    const normalizeText = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, ""); // Keep only alphanumeric
    };

    // Search and calculate highlights
    useEffect(() => {
        if (!file || !highlightData?.text) {
            setHighlightedIndices(new Set());
            return;
        }

        // If we have a target page, jump to it directly
        if (targetPage && targetPage > 0) {
            setPageNumber(targetPage);
        }

        const calculateHighlights = async () => {
            setIsSearching(true);
            try {
                const arrayBuffer = typeof file === 'string' ? await (await fetch(file)).arrayBuffer() : await file.arrayBuffer();
                const pdf = await pdfjs.getDocument(arrayBuffer).promise;
                const cleanHighlight = normalizeText(highlightData.text);
                const newHighlightedIndices = new Set<string>();

                const pageToAnalyze = targetPage || pageNumber;

                const page = await pdf.getPage(pageToAnalyze);
                const textContent = await page.getTextContent();
                const items = textContent.items as any[];

                // Construct full page text and map indices
                const pageCleanText = normalizeText(items.map(item => item.str).join(''));

                if (pageCleanText.includes(cleanHighlight)) {
                    const startIndex = pageCleanText.indexOf(cleanHighlight);
                    const endIndex = startIndex + cleanHighlight.length;

                    let currentCleanIndex = 0;
                    items.forEach((item, index) => {
                        const itemClean = normalizeText(item.str);
                        if (!itemClean) return;

                        const itemStart = currentCleanIndex;
                        const itemEnd = currentCleanIndex + itemClean.length;

                        // Check overlap
                        if (itemStart < endIndex && itemEnd > startIndex) {
                            newHighlightedIndices.add(`${pageToAnalyze}_${index}`);
                        }

                        currentCleanIndex += itemClean.length;
                    });
                }

                setHighlightedIndices(newHighlightedIndices);

                if (!targetPage && pageCleanText.includes(cleanHighlight)) {
                    setPageNumber(pageToAnalyze);
                }

            } catch (error) {
                console.error("Error calculating highlights:", error);
            } finally {
                setIsSearching(false);
            }
        };

        calculateHighlights();
    }, [file, highlightData, targetPage, pageNumber]);

    const textRenderer = useCallback(
        (textItem: any) => {
            if (!highlightData) return textItem.str;

            // react-pdf passes { str, itemIndex } in the object
            // We need to check if this itemIndex is in our set
            const key = `${pageNumber}_${textItem.itemIndex}`;

            if (highlightedIndices.has(key)) {
                return `<span class="bg-yellow-300/50">${textItem.str}</span>`;
            }

            return textItem.str;
        },
        [highlightedIndices, highlightData, pageNumber]
    );

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                        className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-sm text-slate-300">
                        {pageNumber} / {numPages || '--'}
                    </span>
                    <button
                        onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages}
                        className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
                        className="p-1 hover:bg-slate-700 rounded"
                    >
                        <ZoomOut className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-sm text-slate-300 w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
                        className="p-1 hover:bg-slate-700 rounded"
                    >
                        <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-auto bg-slate-900 flex justify-center p-4 relative">
                {isSearching && (
                    <div className="absolute top-4 right-4 z-50 bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow-lg">
                        <Search className="w-3 h-3 animate-spin" />
                        Buscando...
                    </div>
                )}

                <Document
                    file={file}
                    onLoadSuccess={(doc) => {
                        setNumPages(doc.numPages);
                    }}
                    loading={
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            Cargando documento...
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center h-64 text-red-400">
                            Error al cargar el PDF.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        customTextRenderer={textRenderer}
                        className="shadow-2xl"
                    />
                </Document>
            </div>
        </div>
    );
};
