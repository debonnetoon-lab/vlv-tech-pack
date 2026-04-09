/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { TechPackArticle } from "@/types/tech-pack";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0F172A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 20,
    marginBottom: 30,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  companyDetail: {
    fontSize: 7,
    color: "#64748B",
    marginTop: 2,
  },
  titleBlock: {
    marginBottom: 25,
  },
  articleCode: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 4,
  },
  visualGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 25,
  },
  visualItem: {
    flex: 1,
    height: 220,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  col1: { width: "10%" }, // Druk Nr
  col2: { width: "20%" }, // Positie
  col3: { width: "20%" }, // Afmeting
  col4: { width: "18%" }, // Techniek
  col5: { width: "17%" }, // Referentie
  col6: { width: "15%" }, // Kleuren
  label: { fontSize: 7, fontWeight: "bold", color: "#64748B", textTransform: "uppercase" },
  value: { fontSize: 9, marginTop: 2 },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    width: "33%",
  },
  colorSwatch: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#94A3B8",
  },
  sizingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
  },
  sizingCell: {
    width: "16.66%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  sizingLabel: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#64748B",
    marginBottom: 2,
  },
  sizingValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  sizingTotal: {
    backgroundColor: "#0F172A",
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Phase 2: 3-Column Placement Layout
  placementPage: {
    padding: 30,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  placementGrid: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
    minHeight: 400,
  },
  placementCol: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 8,
  },
  placementColWide: {
    flex: 1.5,
  },
  specItem: {
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 6,
    fontWeight: "black",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
  },
  specValueSecondary: {
    fontSize: 7,
    color: "#475569",
    marginTop: 1,
  },
  colorBubble: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 4,
    marginBottom: 4,
  },
  disclaimerBlock: {
    marginTop: 'auto',
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    borderLeftColor: "#0F172A",
  },
  disclaimerText: {
    fontSize: 7,
    color: "#475569",
    lineHeight: 1.5,
    fontStyle: "italic",
    textAlign: "justify",
  }
});

interface Props {
  article: TechPackArticle;
  collectionName: string;
}

const stripEmoji = (text: string = "") => {
  if (!text) return "";
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F3FB}-\u{1F3FF}\u{200D}\u{200B}\u{FE0F}]/gu, '').trim();
};

const COMPANY_INFO = {
  name: "VIVE LE VELO",
  address: "Kasteelstraat 2 - bus 1, 8600 Diksmuide",
  vat: "BE0723453021"
};

const DEFAULT_DISCLAIMER = "Door ondertekening van dit document geeft u akkoord op de bovenstaande specificaties. Kleine afwijkingen in kleur (± 5% Pantone) en maatvoering (± 0.5cm) zijn inherent aan het productieproces en worden aanvaard.";

// Helper to prevent React-PDF from crashing on undefined, null, or boolean
const safeText = (val: any, fallback = "") => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "boolean") return val ? "Ja" : "Nee";
  return String(val);
};

export const TechPackPages = ({ article, collectionName }: Props) => {
  const renderVisuals = (isRepeat: boolean) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{isRepeat ? `Visual Reference (Repeat: ${safeText(article.reference_code, "N/A")})` : "Visuals & Artwork"}</Text>
      <View style={styles.visualGrid}>
        {["front", "back", "artwork"].map((viewType) => {
           const visuals = article.images || (article as any).article_images || [];
           // Fallback support for 'design' in case the database uses that instead of 'artwork'
           const visual = visuals.find((v: any) => v.view === viewType || (viewType === 'artwork' && v.view === 'design'));
           
           if (!visual?.public_url && viewType === "artwork") return null;

           return (
             <View key={viewType} style={[styles.visualItem, viewType === "artwork" ? { border: "2px dashed #CBD5E1", backgroundColor: "#fff" } : {}, isRepeat ? { height: 180 } : {}]}>
                {visual?.public_url ? (
                  <View style={{ width: "100%", height: "100%", padding: 10 }}>
                    <Image src={visual.public_url} style={{ width: "100%", height: "80%", objectFit: "contain" }} />
                    {!isRepeat && viewType === "artwork" && (
                       <View style={{ marginTop: 10, borderTop: "1px solid #F1F5F9", paddingTop: 5 }}>
                          <Text style={{ fontSize: 7, fontWeight: "bold" }}>ARTWORK SPEC</Text>
                          {article.placements?.[0]?.technique && <Text style={{ fontSize: 6, color: "#64748B" }}>Tech: {stripEmoji(safeText(article.placements[0].technique))}</Text>}
                       </View>
                    )}
                  </View>
                ) : (
                  <Text style={{ color: "#CBD5E1", fontSize: 8 }}>{viewType === 'back' ? 'BACK' : viewType.toUpperCase()} VISUAL</Text>
                )}
             </View>
           );
        })}
      </View>
    </View>
  );

  const renderSizingTable = () => {
    const validSizes = article.sizes?.filter(s => (s.order_quantity || 0) > 0) || [];
    if (validSizes.length === 0) return null;

    const totalQty = validSizes.reduce((acc, s) => acc + (s.order_quantity || 0), 0);

    return (
      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Order Quantities ({article.gender || "Unisex"})</Text>
        <View style={styles.sizingGrid}>
          {validSizes.map((s, idx) => (
            <View key={`${s.size_label}-${idx}`} style={styles.sizingCell}>
              <Text style={styles.sizingLabel}>{s.size_label}</Text>
              <Text style={styles.sizingValue}>{s.order_quantity}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sizingTotal}>
          <Text style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}>Totaal aantal te bestellen</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>{totalQty} stuks</Text>
        </View>
      </View>
    );
  };

  const renderPlacementSpecPage = (p: any, index: number, total: number) => (
    <Page key={index} size="A4" style={[styles.page, { padding: 35 }]}>
       <View style={[styles.header, { marginBottom: 15, paddingBottom: 10 }]}>
         <View>
           <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
           <Text style={[styles.label, { fontSize: 8, color: "#0F172A" }]}>DRUK SPECIFICATIE - PAGINA {index + 3}/{total + 2}</Text>
         </View>
         <View style={{ textAlign: "right" }}>
           <Text style={{ fontSize: 10, fontWeight: "bold" }}>{safeText(article.reference_code, "CODE-TBA")}</Text>
           <Text style={{ fontSize: 8, color: "#64748B" }}>{safeText(article.product_name)}</Text>
         </View>
       </View>

       <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
             <View style={{ backgroundColor: "#0F172A", padding: "6 12", borderRadius: 6 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "black" }}>DRUK {safeText(p.print_order_number, String(index + 1))}</Text>
             </View>
             <Text style={{ fontSize: 16, fontWeight: "black", textTransform: "uppercase" }}>{safeText(p.placement_name)}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
             <Text style={styles.label}>KLANT PO</Text>
             <Text style={{ fontSize: 10, fontWeight: "bold" }}>{safeText(article.customer_po, "N/A")}</Text>
          </View>
       </View>

       <View style={styles.placementGrid}>
          {/* Kolom 1: Visual / Mockup */}
          <View style={[styles.placementCol, styles.placementColWide]}>
             <Text style={styles.sectionTitle}>Mockup indicator</Text>
             <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", border: "1px dashed #E2E8F0" }}>
                {p.artwork_url ? (
                  <Image src={p.artwork_url} style={{ width: "95%", height: "95%", objectFit: "contain" }} />
                ) : (
                  <Text style={{ color: "#CBD5E1", fontSize: 8 }}>GEEN ARTWORK UPLOADED</Text>
                )}
             </View>
             <View style={{ marginTop: 10, padding: 8, backgroundColor: "#FEF9C3", borderRadius: 4 }}>
                <Text style={{ fontSize: 7, fontWeight: "bold", color: "#854D0E" }}>INFO: Afmetingen op deze visual zijn indicatief.</Text>
             </View>
          </View>

          {/* Kolom 2: Productie / Techniek */}
          <View style={styles.placementCol}>
             <Text style={styles.sectionTitle}>Productie Specs</Text>
             
             <View style={styles.specItem}>
                <Text style={styles.specLabel}>Techniek</Text>
                <Text style={styles.specValue}>{stripEmoji(safeText(p.technique, "Bedrukken"))}</Text>
                {p.technique_subtype ? <Text style={styles.specValueSecondary}>{safeText(p.technique_subtype)}</Text> : null}
             </View>

             <View style={styles.specItem}>
                <Text style={styles.specLabel}>Applicatie</Text>
                <Text style={styles.specValue}>{stripEmoji(safeText(p.application_method, "N/A"))}</Text>
             </View>

             <View style={styles.specItem}>
                <Text style={styles.specLabel}>Drukkleuren</Text>
                <View style={{ marginTop: 4 }}>
                   {p.color_ids?.map((cid: string, ci: number) => {
                      const color = article.colors?.find(c => c.id === cid || ci.toString() === cid);
                      return (
                         <View key={ci} style={styles.colorBubble}>
                            <View style={{ width: 12, height: 12, backgroundColor: color?.hex_value || "#000", marginRight: 6, borderRadius: 2 }} />
                            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{color?.color_name || "Code: " + cid}</Text>
                         </View>
                      );
                   })}
                   {(!p.color_ids || p.color_ids.length === 0) && <Text style={{ fontSize: 7, color: "#94A3B8" }}>Geen specifieke kleuren</Text>}
                </View>
             </View>
          </View>

          {/* Kolom 3: Positionering */}
          <View style={styles.placementCol}>
             <Text style={styles.sectionTitle}>Positionering</Text>
             
             <View style={styles.specItem}>
                <Text style={styles.specLabel}>Afmeting (W x H)</Text>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>{safeText(p.width_cm, "0")} x {safeText(p.height_cm, "0")} cm</Text>
                <Text style={styles.specValueSecondary}>Surface: {(((Number(p.width_cm) || 0) * (Number(p.height_cm) || 0)) || 0).toFixed(1)} cm²</Text>
             </View>

             <View style={styles.specItem}>
                <Text style={styles.specLabel}>Tolerantie</Text>
                <Text style={styles.specValue}>± {safeText(p.tolerance_cm, "0.5")} cm</Text>
             </View>

             <View style={[styles.specItem, { marginTop: 10, padding: 8, backgroundColor: "#F1F5F9", borderRadius: 6 }]}>
                <Text style={styles.specLabel}>Afstand vanaf naad</Text>
                <Text style={{ fontSize: 13, fontWeight: "black", color: "#0F172A" }}>{safeText(p.reference_distance, "0")} CM</Text>
                <Text style={[styles.specValueSecondary, { fontWeight: "bold", color: "#0F172A", textTransform: "uppercase" }]}>vanaf {safeText(p.reference_point, "Halsnaad")}</Text>
             </View>

             {p.notes && (
                <View style={{ marginTop: 10 }}>
                   <Text style={styles.specLabel}>Instructies</Text>
                   <Text style={{ fontSize: 7, lineHeight: 1.3 }}>{p.notes}</Text>
                </View>
             )}
          </View>
       </View>

       {/* Disclaimer Footer */}
       {article.disclaimer_enabled !== false && (
          <View style={styles.disclaimerBlock}>
             <Text style={{ fontSize: 7, fontWeight: "bold", marginBottom: 3 }}>PRODUCTIE DISCLAIMER</Text>
             <Text style={styles.disclaimerText}>
                {article.disclaimer_text || DEFAULT_DISCLAIMER}
             </Text>
          </View>
       )}

       {/* Visual Reference (Optional Small Visual) */}
       <View style={{ marginTop: 20, flexDirection: "row", gap: 10 }}>
          {["front", "back"].map(view => {
             const img = article.images?.find(v => v.view === view);
             if (!img) return null;
             return (
                <View key={view} style={{ width: 80, height: 80, backgroundColor: "#fff", border: "1px solid #F1F5F9", borderRadius: 4, padding: 5 }}>
                   <Image src={img.public_url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                   <Text style={{ fontSize: 5, color: "#CBD5E1", textAlign: "center", marginTop: 2 }}>{view.toUpperCase()}</Text>
                </View>
             );
          })}
       </View>

       <View style={styles.footer}>
         <View style={{ flexDirection: "column", gap: 2 }}>
           <Text>© {new Date().getFullYear()} VIVE LE VELO - CONFIDENTIAL</Text>
         </View>
         <Text style={{ textAlign: "right" }}>Pagina {index + 3} van {total + 2}</Text>
       </View>
    </Page>
  );

  return (
    <>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.companyDetail}>{COMPANY_INFO.address}</Text>
            <Text style={styles.companyDetail}>BTW: {COMPANY_INFO.vat}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.label}>Technische Fiche - PAGINA 1/2</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Collectie</Text>
            <Text style={styles.value}>{safeText(collectionName)}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.articleCode}>{safeText(article.reference_code, "CODE-TBA")}</Text>
          {article.customer_po ? <Text style={[styles.label, { fontSize: 10, marginBottom: 8, color: "#0F172A" }]}>KLANT PO: {safeText(article.customer_po)}</Text> : null}
          <Text style={styles.productName}>{safeText(article.product_name)}</Text>
        </View>

        {renderVisuals(false)}

        {(article.fabric_main || article.fabric_secondary) && (
          <View style={[styles.section, { marginTop: -15, marginBottom: 25, padding: 10, backgroundColor: "#F8FAFC", borderRadius: 4, borderLeftWidth: 3, borderLeftColor: "#0F172A" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={[styles.label, { color: "#0F172A", marginBottom: 2 }]}>BASIS MATERIAAL / ONDERGROND</Text>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>{safeText(article.fabric_main, "Niet gespecificeerd")}</Text>
                {article.fabric_secondary ? <Text style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>Extra: {safeText(article.fabric_secondary)}</Text> : null}
              </View>
              {article.weight_gsm ? (
                <View style={{ textAlign: "right" }}>
                  <Text style={[styles.label, { color: "#0F172A", marginBottom: 2 }]}>GEWICHT</Text>
                  <Text style={{ fontSize: 11, fontWeight: "bold" }}>{safeText(article.weight_gsm)} GSM</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Specification</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
             {article.colors?.map((c, i) => (
               <View key={i} style={styles.colorRow}>
                 <View style={[styles.colorSwatch, { backgroundColor: c.hex_value }]} />
                 <View>
                    <Text style={{ fontWeight: "bold" }}>{safeText(c.color_name, "Onbekende kleur")}</Text>
                    <Text style={[styles.label, { textTransform: "none" }]}>{safeText(c.pantone_code, "Geen code")}</Text>
                 </View>
               </View>
             ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{ flexDirection: "column", gap: 2 }}>
            <Text>© {new Date().getFullYear()} VIVE LE VELO - CONFIDENTIAL</Text>
            <Text>Concept & Uitwerking door TOON DEBONNE - Alle rechten voorbehouden.</Text>
          </View>
          <Text style={{ textAlign: "right" }}>Pagina 1 van {(article.placements?.length || 0) + 2}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { marginBottom: 20 }]}>
          <View>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.label}>Technische Fiche - PAGINA 2/2</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>{safeText(article.reference_code, "CODE-TBA")}</Text>
            <Text style={{ fontSize: 8, color: "#64748B" }}>{safeText(article.product_name)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications & Placements</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
               <Text style={[styles.col1, styles.label]}>Nr</Text>
               <Text style={[styles.col2, styles.label]}>Positie</Text>
               <Text style={[styles.col3, styles.label]}>Afmeting</Text>
               <Text style={[styles.col4, styles.label]}>Techniek</Text>
               <Text style={[styles.col5, styles.label]}>Referentie</Text>
               <Text style={[styles.col6, styles.label]}>Kleuren</Text>
            </View>
            {article.placements?.map((p, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{safeText(p.print_order_number, String(i + 1))}</Text>
                <Text style={styles.col2}>{safeText(p.placement_name)}</Text>
                <Text style={styles.col3}>
                  {safeText(p.width_cm)} x {safeText(p.height_cm)} cm{"\n"}
                  <Text style={{ fontSize: 7, color: "#64748B" }}>± {safeText(p.tolerance_cm, "0.5")} cm</Text>
                </Text>
                <Text style={styles.col4}>
                  {safeText(p.technique)}{"\n"}
                  <Text style={{ fontSize: 6, color: "#64748B" }}>{safeText(p.technique_subtype, "")}{p.application_method ? ` (${safeText(p.application_method)})` : ""}</Text>
                </Text>
                <Text style={styles.col5}>
                  {safeText(p.reference_distance, "0")} cm{"\n"}
                  <Text style={{ fontSize: 6, color: "#64748B" }}>vanaf {safeText(p.reference_point, "Halsnaad")}</Text>
                </Text>
                <View style={[styles.col6, { flexDirection: "row", flexWrap: "wrap", gap: 2 }]}>
                   {p.color_ids?.map((cid, ci) => {
                     const color = article.colors?.find(c => c.id === cid || ci.toString() === cid);
                     return (
                        <View key={ci} style={{ width: 8, height: 8, backgroundColor: color?.hex_value || "#000", border: "0.5px solid #E2E8F0" }} />
                     );
                   })}
                   {(!p.color_ids || p.color_ids.length === 0) && <Text style={{ fontSize: 6, color: "#CBD5E1" }}>N/A</Text>}
                </View>
              </View>
            ))}
            {(article.label_type || article.packaging) && (
               <View style={{ marginTop: 15, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 6, borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontSize: 8, fontWeight: "black", marginBottom: 8, color: "#0F172A", textTransform: "uppercase", letterSpacing: 1 }}>LABELS & VERPAKKING</Text>
                  <View style={{ flexDirection: "row", gap: 20 }}>
                    {article.label_type ? (
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { fontSize: 6, marginBottom: 2 }]}>LABELLING</Text>
                        <Text style={{ fontSize: 8, fontWeight: "bold" }}>{safeText(article.label_type)}</Text>
                        <Text style={{ fontSize: 7, color: "#64748B" }}>Positie: {safeText(article.label_position)}</Text>
                        {article.label_content ? <Text style={{ fontSize: 7, color: "#64748B", marginTop: 2 }}>Inhoud: {safeText(article.label_content)}</Text> : null}
                      </View>
                    ) : null}
                    {(article.packaging && article.packaging !== "none") ? (
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { fontSize: 6, marginBottom: 2 }]}>VERPAKKING</Text>
                        <Text style={{ fontSize: 8, fontWeight: "bold" }}>{safeText(article.packaging)}</Text>
                        <Text style={{ fontSize: 7, color: "#64748B" }}>{safeText(article.packaging_notes, "Standaard verpakking")}</Text>
                      </View>
                    ) : null}
                  </View>
               </View>
            )}
          </View>
        </View>

        {renderSizingTable()}

        {article.description && typeof article.description === 'string' && article.description.trim() !== "" && (
          <View style={[styles.section, { backgroundColor: "#FEF2F2", padding: 15, borderLeft: "4px solid #EF4444" }]}>
             <Text style={{ fontSize: 9, fontWeight: "bold", color: "#B91C1C", marginBottom: 6 }}>OPMERKINGEN / BELANGRIJK</Text>
             <Text style={{ fontSize: 8, color: "#DC2626", lineHeight: 1.4 }}>
               {article.description}
             </Text>
          </View>
        )}

        <View style={{ marginTop: "auto" }}>
           {renderVisuals(true)}
        </View>

        <View style={styles.footer}>
          <View style={{ flexDirection: "column", gap: 2 }}>
            <Text>© {new Date().getFullYear()} VIVE LE VELO - CONFIDENTIAL</Text>
            <Text>Concept & Uitwerking door TOON DEBONNE - Alle rechten voorbehouden.</Text>
          </View>
          <Text style={{ textAlign: "right" }}>Pagina 2 van {(article.placements?.length || 0) + 2}</Text>
        </View>
      </Page>

      {/* NEW: Per-Placement Production Pages */}
      {article.placements?.map((p, index) => 
        renderPlacementSpecPage(p, index, article.placements?.length || 0)
      )}
    </>
  );
};

export const TechPackDocument = (props: Props) => (
  <Document>
    <TechPackPages {...props} />
  </Document>
);

export const BulkTechPackDocument = ({ articles, collectionName }: { articles: TechPackArticle[], collectionName: string }) => (
  <Document>
    {articles.map((article) => (
      <TechPackPages key={article.id} article={article} collectionName={collectionName} />
    ))}
  </Document>
);
