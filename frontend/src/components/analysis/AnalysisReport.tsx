import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AnalysisResult } from '../../types/analysis';

// Register fonts (optional, using default Helvetica for now)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#333',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // Slate 800
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b', // Slate 500
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2563eb', // Blue 600
        textTransform: 'uppercase',
    },
    summaryBox: {
        backgroundColor: '#f1f5f9', // Slate 100
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
    },
    summaryText: {
        lineHeight: 1.5,
    },
    riskItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fef2f2', // Red 50
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444', // Red 500
    },
    riskTitle: {
        fontWeight: 'bold',
        color: '#991b1b', // Red 800
        marginBottom: 4,
    },
    clauseItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fffbeb', // Amber 50
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b', // Amber 500
    },
    clauseTitle: {
        fontWeight: 'bold',
        color: '#92400e', // Amber 800
        marginBottom: 4,
    },
    text: {
        marginBottom: 4,
        lineHeight: 1.4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
});

interface AnalysisReportProps {
    result: AnalysisResult;
}

export const AnalysisReport = ({ result }: AnalysisReportProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Reporte de Análisis Legal</Text>
                    <Text style={styles.subtitle}>Generado por Legalyze AI</Text>
                </View>
                <View>
                    <Text style={styles.subtitle}>{new Date().toLocaleDateString()}</Text>
                    <Text style={styles.subtitle}>{result.originalFileName}</Text>
                </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>{result.summary}</Text>
                </View>
            </View>

            {/* Risks */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Riesgos Detectados</Text>
                {result.risks && result.risks.length > 0 ? (
                    result.risks.map((risk, i) => (
                        <View key={i} style={styles.riskItem}>
                            <Text style={styles.riskTitle}>
                                {risk.title} ({risk.severity})
                            </Text>
                            <Text style={styles.text}>{risk.description}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.text}>No se detectaron riesgos significativos.</Text>
                )}
            </View>

            {/* Clauses */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cláusulas Importantes</Text>
                {result.keyClauses && result.keyClauses.length > 0 ? (
                    result.keyClauses.map((clause, i) => (
                        <View key={i} style={styles.clauseItem}>
                            <Text style={styles.clauseTitle}>{clause.title}</Text>
                            <Text style={styles.text}>{clause.description}</Text>
                            <Text style={[styles.text, { fontStyle: 'italic', fontSize: 10, color: '#666' }]}>
                                "{clause.clauseText}"
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.text}>No se encontraron cláusulas críticas.</Text>
                )}
            </View>

            {/* Footer */}
            <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `Página ${pageNumber} de ${totalPages} - Documento Confidencial`
            )} fixed />
        </Page>
    </Document>
);
