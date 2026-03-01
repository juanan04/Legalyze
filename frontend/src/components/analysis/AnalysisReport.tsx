import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AnalysisResult } from '../../types/analysis';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 15,
        marginBottom: 30,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'extrabold',
        color: '#2563eb',
    },
    reportTitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dateText: {
        fontSize: 10,
        color: '#94a3b8',
    },
    titleSection: {
        textAlign: 'center',
        marginBottom: 30,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 10,
    },
    healthScoreContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#f1f5f9',
    },
    scoreText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    scoreLabel: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    verdictBox: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 30,
    },
    verdictText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563eb',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 5,
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    findingsList: {
        marginBottom: 20,
    },
    findingItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    checkIcon: {
        fontSize: 12,
        marginRight: 8,
        color: '#475569',
    },
    findingText: {
        fontSize: 11,
        color: '#334155',
        flex: 1,
        lineHeight: 1.4,
    },
    summaryText: {
        fontSize: 11,
        color: '#475569',
        lineHeight: 1.5,
        marginBottom: 20,
    },
    // Table Styles
    table: {
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableColLocation: {
        width: '12%',
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    tableColOriginal: {
        width: '28%',
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    tableColRisk: {
        width: '32%',
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    tableColProposed: {
        width: '28%',
        padding: 8,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    tableCell: {
        fontSize: 9,
        color: '#334155',
        lineHeight: 1.3,
    },
    tableCellHighlight: {
        backgroundColor: '#fef2f2',
    },
    // Disclaimer
    disclaimerBox: {
        marginTop: 'auto',
        padding: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        alignItems: 'center',
    },
    disclaimerText: {
        fontSize: 10,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
});

interface AnalysisReportProps {
    result: AnalysisResult;
}

const Header = () => (
    <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Text style={styles.logoText}>Legalyze</Text>
            <Text style={styles.reportTitle}>Informe de Auditoría Preventiva</Text>
        </View>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES')}</Text>
    </View>
);

const Footer = () => (
    <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `Página ${pageNumber} de ${totalPages} - Documento Confidencial generado por Legalyze - Auditoría Preventiva`
    )} fixed />
);

export const AnalysisReport = ({ result }: AnalysisReportProps) => {
    // Determine the color of the score circle
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'; // Green
        if (score >= 50) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <Document>
            {/* Página 1: Resumen de Cumplimiento */}
            <Page size="A4" style={styles.page}>
                <Header />

                <View style={styles.titleSection}>
                    <Text style={styles.pageTitle}>Resumen de Cumplimiento</Text>
                </View>

                {/* Score */}
                <View style={styles.healthScoreContainer}>
                    <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.healthScore || 0) }]}>
                        <Text style={styles.scoreText}>{result.healthScore || 0}%</Text>
                        <Text style={styles.scoreLabel}>Salud Legal</Text>
                    </View>
                </View>

                {/* Contract Type */}
                <View style={[styles.verdictBox, { marginBottom: 15 }]}>
                    <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 5 }]}>Tipo de Contrato Detectado</Text>
                    <Text style={styles.verdictText}>{result.contractType || "Contrato de Arrendamiento"}</Text>
                </View>

                {/* Verdict */}
                <View style={styles.verdictBox}>
                    <Text style={styles.verdictText}>{result.verdict || "Análisis completado."}</Text>
                </View>

                {/* Summary */}
                <Text style={styles.sectionTitle}>Resumen General</Text>
                <Text style={styles.summaryText}>{result.summary}</Text>

                {/* Findings */}
                <Text style={styles.sectionTitle}>Resumen de Hallazgos</Text>
                <View style={styles.findingsList}>
                    {(result.findingsSummary || []).map((finding, index) => (
                        <View key={index} style={styles.findingItem}>
                            <Text style={styles.checkIcon}>[X]</Text>
                            <Text style={styles.findingText}>{finding}</Text>
                        </View>
                    ))}
                    {(!result.findingsSummary || result.findingsSummary.length === 0) && (
                        <Text style={styles.findingText}>No hay hallazgos específicos.</Text>
                    )}
                </View>

                <Footer />
            </Page>

            {/* Página 2: Análisis Detallado */}
            <Page size="A4" style={styles.page}>
                <Header />

                <Text style={styles.pageTitle}>Análisis Detallado</Text>

                <View style={styles.table}>
                    <View style={styles.tableRowHeader}>
                        <View style={styles.tableColLocation}><Text style={styles.tableHeaderCell}>Ubicación</Text></View>
                        <View style={styles.tableColOriginal}><Text style={styles.tableHeaderCell}>Cláusula Original</Text></View>
                        <View style={styles.tableColRisk}><Text style={styles.tableHeaderCell}>Riesgo Detectado</Text></View>
                        <View style={styles.tableColProposed}><Text style={styles.tableHeaderCell}>Propuesta Correcta</Text></View>
                    </View>

                    {(result.detailedAnalysis || []).map((detail, idx) => (
                        <View key={idx} style={[styles.tableRow, detail.riskLevel?.toUpperCase() === 'CRÍTICO' ? styles.tableCellHighlight : {}]} wrap={false}>
                            <View style={styles.tableColLocation}>
                                <Text style={styles.tableCell}>{detail.location}</Text>
                            </View>
                            <View style={styles.tableColOriginal}>
                                <Text style={styles.tableCell}>{detail.originalClause}</Text>
                            </View>
                            <View style={styles.tableColRisk}>
                                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{detail.riskLevel}</Text>
                                <Text style={styles.tableCell}>{detail.riskDetected}</Text>
                            </View>
                            <View style={styles.tableColProposed}>
                                <Text style={styles.tableCell}>{detail.proposedWording}</Text>
                            </View>
                        </View>
                    ))}

                    {(!result.detailedAnalysis || result.detailedAnalysis.length === 0) && (
                        <View style={styles.tableRow}>
                            <View style={{ width: '100%', padding: 10 }}>
                                <Text style={styles.tableCell}>No se encontraron cláusulas para analizar en detalle.</Text>
                            </View>
                        </View>
                    )}
                </View>

                <Footer />
            </Page>

            {/* Página 3: Disclaimer */}
            <Page size="A4" style={styles.page}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={styles.disclaimerBox}>
                        <Text style={[styles.pageTitle, { color: '#64748b' }]}>Disclaimer</Text>
                        <Text style={styles.disclaimerText}>
                            Este informe es un análisis técnico preliminar de posibles riesgos contractuales realizado mediante Inteligencia Artificial. No sustituye en ningún caso el asesoramiento jurídico de un abogado colegiado.
                        </Text>
                        <Text style={[styles.disclaimerText, { marginTop: 10, fontWeight: 'bold' }]}>
                            Legalyze no se hace responsable de decisiones legales, económicas o de cualquier índole tomadas basadas única o parcialmente en este documento.
                        </Text>
                    </View>
                </View>
                <Footer />
            </Page>
        </Document>
    );
};
