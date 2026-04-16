/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Canvas } from "@react-pdf/renderer";
import { TechPackProduct, SizeMeasurement } from "@/types/tech-pack";
import { PDF_STRINGS } from "@/lib/pdf-strings";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 9, color: "#0F172A", backgroundColor: "#FFFFFF" },
  
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, paddingBottom: 15, borderBottomWidth: 2, borderBottomColor: "#000" },
  brandTitle: { fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 },
  headerRight: { textAlign: "right" },
  headerText: { fontSize: 7, color: "#475569", marginBottom: 2 },
  
  // Title Block
  titleBlock: { marginBottom: 20 },
  articleCode: { fontSize: 32, fontWeight: 900, color: "#0F172A", letterSpacing: -1 },
  klantPo: { fontSize: 9, fontWeight: 900, textTransform: "uppercase", marginTop: 4 },
  productName: { fontSize: 13, color: "#64748B", textTransform: "uppercase", marginTop: 4, letterSpacing: 0.5 },

  // Sections
  sectionLabel: { fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, color: "#94A3B8", marginBottom: 10 },
  
  // Visuals Grid Page 1
  visualsGrid: { flexDirection: "row", gap: 15, marginBottom: 20 },
  visualBox: { flex: 1, height: 260, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center", padding: 10 },
  artworkBox: { flex: 1, height: 260, backgroundColor: "#FFFFFF", border: "1px dashed #CBD5E1", justifyContent: "center", alignItems: "center", padding: 10, position: "relative" },
  artworkSpecBottom: { position: "absolute", bottom: 10, left: 10 },
  artworkSpecTitle: { fontSize: 8, fontWeight: 900 },
  artworkSpecDesc: { fontSize: 7, color: "#64748B" },

  // Mat Block & Color Block
  infoRow: { flexDirection: "row", gap: 20, marginBottom: 20 },
  infoBox: { flex: 1, backgroundColor: "#F8FAFC", padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 7, fontWeight: 900, textTransform: "uppercase" },
  infoValue: { fontSize: 11, fontWeight: 900, marginTop: 2 },
  infoSub: { fontSize: 8, color: "#64748B", marginTop: 2 },

  // Tables
  table: { width: "100%", marginBottom: 20 },
  trHead: { flexDirection: "row", borderBottom: "1.5px solid #CBD5E1", paddingBottom: 8, marginBottom: 8 },
  th: { fontSize: 7, fontWeight: 900, color: "#64748B", textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottom: "1px solid #E2E8F0", paddingVertical: 10, alignItems: "center" },
  tdBase: { fontSize: 8, color: "#0F172A", paddingRight: 4 },
  tdBold: { fontSize: 8, fontWeight: 900, color: "#0F172A" },
  tdSub: { fontSize: 7, color: "#64748B" },

  // Labels & Verpakking
  labelsBox: { backgroundColor: "#F8FAFC", padding: 15, flexDirection: "row", gap: 40, marginBottom: 20 },

  // Order Quantities
  orderBox: { marginBottom: 20 },
  orderHeader: { flexDirection: "row" },
  orderRow: { flexDirection: "row", border: "1px solid #E2E8F0" },
  orderCellHead: { flex: 1, paddingVertical: 8, textAlign: "center", fontSize: 7, fontWeight: 900, borderRight: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" },
  orderCell: { flex: 1, paddingVertical: 10, textAlign: "center", fontSize: 10, fontWeight: 900, borderRight: "1px solid #E2E8F0" },
  totalRow: { backgroundColor: "#0F172A", flexDirection: "row", justifyContent: "space-between", padding: 12, alignItems: "center", borderRadius: 4, marginTop: 5 },
  totalLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: 900, textTransform: "uppercase" },
  totalValue: { color: "#FFFFFF", fontSize: 12, fontWeight: 900 },

  // Waarschuwing
  warningBox: { backgroundColor: "#FEF2F2", borderLeft: "4px solid #EF4444", padding: 15, marginBottom: 30 },
  warningTitle: { color: "#EF4444", fontSize: 9, fontWeight: 900, textTransform: "uppercase", marginBottom: 4 },
  warningText: { color: "#EF4444", fontSize: 8 },

  // Smaller visuals repeat
  visualMiniRow: { flexDirection: "row", gap: 10, height: 140 },

  // P3 Layout
  badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  badge: { backgroundColor: "#0F172A", color: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 15, borderRadius: 4, fontSize: 12, fontWeight: 900 },
  badgePos: { fontSize: 14, fontWeight: 900, color: "#0F172A", marginLeft: 15 },
  
  col3Layout: { flexDirection: "row", gap: 15, flex: 1 },
  p3Col: { flex: 1, backgroundColor: "#F8FAFC", borderRadius: 8, padding: 15 },
  p3BoxDashed: { flex: 1, border: "1px dashed #CBD5E1", backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  yellowNote: { backgroundColor: "#FEF08A", padding: 8, borderRadius: 4, textAlign: "center" },
  listProp: { marginBottom: 15 },
  listLabel: { fontSize: 7, fontWeight: 900, textTransform: "uppercase", color: "#64748B", marginBottom: 2 },
  listValue: { fontSize: 11, fontWeight: 900, color: "#0F172A" },
  listSub: { fontSize: 8, color: "#64748B", marginTop: 1 },
  grayMetricBox: { backgroundColor: "#F1F5F9", padding: 10, borderRadius: 4, marginTop: 10 },
  
  disclaimerBox: { borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 4, borderLeftColor: "#0F172A", padding: 15, borderRadius: 4, marginTop: 20 },
  
  // Footer Standard
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 7, color: "#94A3B8" }
});

const safeText = (val: any, fallback = "-") => {
  if (val === null || val === undefined || val === "") return fallback;
  return String(val);
};

const Header = ({ title, date, orgName, collectionName, pageIndex, totalPages }: any) => (
  <View style={styles.header} fixed>
    <View>
      <Text style={styles.brandTitle}>{orgName}</Text>
      <Text style={[styles.headerText, { marginTop: 4 }]}>VLV PRODUCTION HUB</Text>
      <Text style={styles.headerText}>Ref: Tech-Pack-v2</Text>
    </View>
    <View style={styles.headerRight}>
      <Text style={styles.headerText}>{title} - {PDF_STRINGS.page.toUpperCase()} {pageIndex}/{totalPages}</Text>
      <Text style={styles.headerText}>{date}</Text>
      <Text style={styles.headerText}>{PDF_STRINGS.collection}</Text>
      <Text style={[styles.headerText, { fontWeight: 900, color: "#0F172A" }]}>{collectionName}</Text>
    </View>
  </View>
);

const Footer = ({ pageIndex, totalPages }: any) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>© {new Date().getFullYear()} VIVE LE VELO - {PDF_STRINGS.confidential}</Text>
    <Text style={styles.footerText}>{PDF_STRINGS.page} {pageIndex} {PDF_STRINGS.of} {totalPages}</Text>
  </View>
);

const Watermark = ({ isApproved }: { isApproved: boolean }) => (
  <Canvas
    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
    paint={(ctx, width, height) => {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-45 * Math.PI / 180);
      ctx.opacity(0.1);
      ctx.fontSize(120);
      ctx.fillColor(isApproved ? "#22C55E" : "#EF4444");
      
      const label = isApproved ? PDF_STRINGS.approved : PDF_STRINGS.draft;
      for (let i = -2; i <= 2; i++) {
        ctx.text(label, -200, i * 150);
      }
      ctx.restore();
      return null;
    }}
  />
);

export const TechPackPages = ({ article, organization, collectionName }: any) => {
  const images = article.images || [];
  const colorways = article.colorways || [];
  const placements = (article as any).artwork_placements || article.placements || [];
  const materials = (article as any).materials || [];
  const pomPoints = (article as any).measurement_points || [];
  
  const date = new Date().toLocaleDateString('en-GB'); 
  const orgName = organization?.name || "VIVE LE VELO";
  const isApproved = article.status === 'approved';
  
  const sizeGamma = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].filter(s => 
    article.sizes?.some((sz: any) => sz.size_label === s)
  );

  const totalQuantity = (article.sizes || []).reduce((acc: number, s: SizeMeasurement) => acc + (s.order_quantity || 0), 0);

  return (
    <>
      {/* PAGE 1: VISUALS & IDENTITY */}
      <Page size="A4" style={styles.page}>
        <Watermark isApproved={isApproved} />
        <Header title={PDF_STRINGS.documentTitle} date={date} orgName={orgName} collectionName={collectionName || "VLV Collection"} pageIndex={1} totalPages={3} />
        
        <View style={styles.titleBlock}>
          <Text style={styles.articleCode}>{safeText(article.article_code, "REF-TBA")}</Text>
          <Text style={styles.klantPo}>{PDF_STRINGS.klantPo}: {safeText(article.customer_po, "/////")}</Text>
          <Text style={styles.productName}>{safeText(article.name)}</Text>
        </View>

        <Text style={styles.sectionLabel}>{PDF_STRINGS.visualRef}</Text>
        <View style={styles.visualsGrid}>
          <View style={styles.visualBox}>
            {images.find((img: any) => img.view === 'front')?.public_url ? (
              <Image src={images.find((img: any) => img.view === 'front').public_url} style={{ width: "90%", height: "90%", objectFit: "contain" }} />
            ) : null}
          </View>
          <View style={styles.visualBox}>
            {images.find((img: any) => img.view === 'back')?.public_url ? (
              <Image src={images.find((img: any) => img.view === 'back').public_url} style={{ width: "90%", height: "90%", objectFit: "contain" }} />
            ) : null}
          </View>
          <View style={styles.artworkBox}>
            {images.find((img: any) => img.view === 'artwork')?.public_url ? (
              <Image src={images.find((img: any) => img.view === 'artwork').public_url} style={{ width: "90%", height: "90%", objectFit: "contain" }} />
            ) : null}
            <View style={styles.artworkSpecBottom}>
              <Text style={styles.artworkSpecTitle}>SKETCH / REF</Text>
              <Text style={styles.artworkSpecDesc}>{PDF_STRINGS.garmentType}: {safeText(article.garment_type, "Standard")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View>
              <Text style={styles.infoLabel}>{PDF_STRINGS.fabricMain}</Text>
              <Text style={styles.infoValue}>{safeText(article.fabric_main || materials[0]?.name, "100% Cotton")}</Text>
              <Text style={styles.infoSub}>{safeText(article.fabric_secondary || materials[1]?.name, "N/A")}</Text>
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={styles.infoLabel}>{PDF_STRINGS.gsmWeight}</Text>
              <Text style={styles.infoValue}>{safeText(article.weight_gsm || materials[0]?.weight_gsm, "155")} GSM</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{PDF_STRINGS.colorSpec}</Text>
        <View style={{ flexDirection: "row", gap: 15, flexWrap: "wrap" }}>
          {colorways.length > 0 ? colorways.map((c: any, i: number) => (
            <View key={i} style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 5 }}>
              <View style={{ width: 30, height: 30, backgroundColor: c.hex_code || "#CBD5E1" }} />
              <View>
                <Text style={styles.tdBold}>{safeText(c.name)}</Text>
                <Text style={styles.tdSub}>{safeText(c.pantone_code, "CMYK")}</Text>
              </View>
            </View>
          )) : (
            <Text style={styles.tdSub}>No specific colorways defined.</Text>
          )}
        </View>

        <Footer pageIndex={1} totalPages={3} />
      </Page>

      {/* PAGE 2: TECHNICAL TABLES & POM */}
      <Page size="A4" style={styles.page}>
        <Watermark isApproved={isApproved} />
        <Header title={PDF_STRINGS.specificationsTitle} date={date} orgName={orgName} collectionName={collectionName} pageIndex={2} totalPages={3} />

        <Text style={styles.sectionLabel}>{PDF_STRINGS.materialsTitle}</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { width: "30%" }]}>{PDF_STRINGS.matName}</Text>
            <Text style={[styles.th, { width: "25%" }]}>{PDF_STRINGS.matComp}</Text>
            <Text style={[styles.th, { width: "10%" }]}>{PDF_STRINGS.matWeight}</Text>
            <Text style={[styles.th, { width: "35%" }]}>{PDF_STRINGS.matSupplier}</Text>
          </View>
          {materials.length > 0 ? materials.map((m: any, i: number) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.tdBold, { width: "30%" }]}>{safeText(m.name)}</Text>
              <Text style={[styles.tdBase, { width: "25%" }]}>{safeText(m.composition)}</Text>
              <Text style={[styles.tdBase, { width: "10%" }]}>{m.weight_gsm || "-"} g</Text>
              <Text style={[styles.tdSub, { width: "35%" }]}>{safeText(m.supplier_article_code, "Standard")}</Text>
            </View>
          )) : (
            <Text style={styles.tdSub}>No materials specified.</Text>
          )}
        </View>

        {/* HIDDEN BY REQUEST 
        <Text style={styles.sectionLabel}>{PDF_STRINGS.sizeSpecsTitle}</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
             <Text style={[styles.th, { width: "40%" }]}>{PDF_STRINGS.pomLabel}</Text>
             <Text style={[styles.th, { width: "10%" }]}>{PDF_STRINGS.toleranceLabel}</Text>
             {sizeGamma.map(size => (
                <Text key={size} style={[styles.th, { flex: 1, textAlign: "center" }]}>{size}</Text>
             ))}
          </View>
          {pomPoints.length > 0 ? pomPoints.map((p: any, i: number) => (
             <View key={i} style={styles.tr}>
                <Text style={[styles.tdBold, { width: "40%" }]}>{safeText(p.point_of_measurement)}</Text>
                <Text style={[styles.tdSub, { width: "10%" }]}>{PDF_STRINGS.approx} {p.tolerance_cm || 0.5}</Text>
                {sizeGamma.map(size => (
                   <Text key={size} style={[styles.tdBase, { flex: 1, textAlign: "center", fontWeight: size === "M" ? 900 : 400 }]}>
                      {p.measurements?.[size] || "-"}
                   </Text>
                ))}
             </View>
          )) : (
             <Text style={styles.tdSub}>No measurement points configured.</Text>
          )}
        </View>
        */}

        <View style={{ flexDirection: "row", gap: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>{PDF_STRINGS.orderQtyTitle}</Text>
            <View style={styles.orderBox}>
              <View style={styles.orderRow}>
                {sizeGamma.map(size => (
                  <Text key={size} style={styles.orderCellHead}>{size}</Text>
                ))}
              </View>
              <View style={styles.orderRow}>
                {sizeGamma.map(size => (
                  <Text key={size} style={styles.orderCell}>
                    {article.sizes?.find((s: any) => s.size_label === size)?.order_quantity || 0}
                  </Text>
                ))}
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{PDF_STRINGS.totalOrderLabel}</Text>
                <Text style={styles.totalValue}>{totalQuantity} {PDF_STRINGS.units}</Text>
              </View>
            </View>
          </View>
          
          <View style={{ width: "30%" }}>
            <Text style={styles.sectionLabel}>{PDF_STRINGS.labelsTitle}</Text>
            <View style={[styles.p3Col, { backgroundColor: "#F1F5F9" }]}>
               <Text style={styles.listLabel}>{PDF_STRINGS.labelling}</Text>
               <Text style={styles.tdBold}>{safeText(article.label_type, "Printed")}</Text>
               <Text style={styles.listLabel}>{PDF_STRINGS.packaging}</Text>
               <Text style={styles.tdBold}>{safeText(article.packaging, "Polybag")}</Text>
            </View>
          </View>
        </View>

        <Footer pageIndex={2} totalPages={3} />
      </Page>

      {/* PAGE 3: ARTWORK & PLACEMENTS */}
      <Page size="A4" style={styles.page}>
        <Watermark isApproved={isApproved} />
        <Header title={PDF_STRINGS.printSpecTitle} date={date} orgName={orgName} collectionName={collectionName} pageIndex={3} totalPages={3} />

        {placements.length > 0 ? placements.slice(0, 2).map((p: any, idx: number) => (
          <View key={idx} style={{ marginBottom: 25 }}>
            <View style={styles.badgeRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.badge}>PRINT {idx + 1}</Text>
                <Text style={styles.badgePos}>{safeText(p.placement_name).toUpperCase()}</Text>
              </View>
              <Text style={[styles.headerText, { fontWeight: 900 }]}>{PDF_STRINGS.klantPo}: {safeText(article.customer_po, "/////")}</Text>
            </View>

            <View style={styles.col3Layout}>
              <View style={styles.p3Col}>
                <Text style={styles.sectionLabel}>{PDF_STRINGS.mockupIndicator}</Text>
                <View style={styles.p3BoxDashed}>
                  {images.find((img: any) => img.view === 'artwork')?.public_url ? (
                     <Image src={images.find((img: any) => img.view === 'artwork').public_url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                     <Text style={{ fontSize: 8, color: "#CBD5E1", fontWeight: 900 }}>NO ARTWORK</Text>
                  )}
                </View>
                <View style={styles.yellowNote}>
                  <Text style={{ fontSize: 7, fontWeight: 900, color: "#854D0E" }}>{PDF_STRINGS.infoDisclaimer}</Text>
                </View>
              </View>
              
              <View style={styles.p3Col}>
                <Text style={styles.sectionLabel}>{PDF_STRINGS.productionSpecs}</Text>
                <View style={styles.listProp}>
                  <Text style={styles.listLabel}>{PDF_STRINGS.technique}</Text>
                  <Text style={styles.listValue}>{safeText(p.technique, "Screenprint")}</Text>
                  <Text style={styles.listSub}>{safeText(p.technique_subtype, "Standard")}</Text>
                </View>
                <View style={styles.listProp}>
                  <Text style={styles.listLabel}>{PDF_STRINGS.application}</Text>
                  <Text style={styles.listValue}>{safeText(p.application_method, "Heatpress")}</Text>
                </View>
                <View style={styles.listProp}>
                  <Text style={styles.listLabel}>{PDF_STRINGS.printColors}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, backgroundColor: "#FFFFFF", padding: 6, borderRadius: 4 }}>
                    <View style={{ width: 14, height: 14, backgroundColor: "#000000" }} />
                    <Text style={{ fontSize: 8, fontWeight: 900 }}>Standard</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.p3Col}>
                <Text style={styles.sectionLabel}>{PDF_STRINGS.positioning}</Text>
                <View style={styles.listProp}>
                  <Text style={styles.listLabel}>{PDF_STRINGS.dimWidthHeight}</Text>
                  <Text style={styles.listValue}>{p.width_cm} x {p.height_cm} cm</Text>
                </View>
                <View style={styles.listProp}>
                  <Text style={styles.listLabel}>{PDF_STRINGS.tolerance}</Text>
                  <Text style={styles.listValue}>{PDF_STRINGS.approx} {p.tolerance_cm || 0.5} cm</Text>
                </View>
                <View style={styles.grayMetricBox}>
                  <Text style={[styles.listLabel, { fontSize: 6 }]}>{PDF_STRINGS.distFromSeam}</Text>
                  <Text style={[styles.listValue, { fontSize: 13, marginVertical: 2 }]}>{p.reference_distance || 6.5} CM</Text>
                  <Text style={[styles.listLabel, { fontSize: 7, color: "#0F172A" }]}>{PDF_STRINGS.from.toUpperCase()} {PDF_STRINGS.fromNape.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        )) : (
          <Text style={styles.tdSub}>No placements configured for this article.</Text>
        )}

        <View style={styles.disclaimerBox}>
          <Text style={[styles.sectionLabel, { color: "#0F172A", marginBottom: 4 }]}>{PDF_STRINGS.productionDisclaimerTitle}</Text>
          <Text style={{ fontSize: 7, color: "#475569", lineHeight: 1.5 }}>
            {PDF_STRINGS.productionDisclaimerText}
          </Text>
        </View>

        <Footer pageIndex={3} totalPages={3} />
      </Page>
    </>
  );
};

export const TechPackDocument = (props: any) => (
  <Document>
    <TechPackPages {...props} />
  </Document>
);

export const BulkTechPackDocument = ({ articles, ...props }: any) => (
  <Document>
    {articles.map((article: any) => (
      <TechPackPages key={article.id} article={article} {...props} />
    ))}
  </Document>
);
