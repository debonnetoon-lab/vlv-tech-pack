import { useMemo } from 'react';
import { TechPackProduct } from '@/types/tech-pack';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<number, string[]>;
  missingFields: { step: number; label: string; field: string }[];
}

export const useTechPackValidation = (product: TechPackProduct | null): ValidationResult => {
  return useMemo(() => {
    const result: ValidationResult = {
      isValid: true,
      errors: {},
      missingFields: [],
    };

    if (!product) {
      result.isValid = false;
      return result;
    }

    const addError = (step: number, label: string, field: string) => {
      if (!result.errors[step]) result.errors[step] = [];
      result.errors[step].push(label);
      result.missingFields.push({ step, label, field });
      result.isValid = false;
    };

    // Step 1: Algemeen
    if (!product.name || product.name.trim() === '') addError(1, "Product Naam", "name");
    if (!product.article_code || product.article_code.trim() === '') addError(1, "Artikel Code", "article_code");
    if (!product.garment_type) addError(1, "Product Type", "garment_type");

    // Step 2: Visuals
    const images = product.images || [];
    const hasFrontView = images.some(img => img.view === 'front');
    if (!hasFrontView) addError(2, "Voorkant Mockup", "front_image");

    // Step 3: Prints
    const placements = (product as any).artwork_placements || [];
    placements.forEach((p: any, idx: number) => {
      const pName = p.placement_name || `Print ${idx + 1}`;
      if (!p.technique) addError(3, `${pName}: Techniek`, "technique");
      if (!p.width_cm || !p.height_cm) addError(3, `${pName}: Afmetingen (B x H)`, "dimensions");
      if (!p.reference_distance) addError(3, `${pName}: Positie Referentie`, "reference_distance");
    });

    // Step 4: Colorways
    const colorways = product.colorways || [];
    if (colorways.length === 0) addError(4, "Minimaal 1 Kleur", "colorways");

    // Step 5: Materials
    const materials = (product as any).materials || [];
    if (materials.length === 0) {
      addError(5, "Hoofdstof Vereist", "materials");
    } else {
      const main = materials[0];
      if (!main.name) addError(5, "Stofnaam (Hoofdstof)", "fabric_name");
      if (!main.composition) addError(5, "Samenstelling (Hoofdstof)", "fabric_comp");
      if (!main.weight_gsm) addError(5, "GSM Gewicht (Hoofdstof)", "fabric_gsm");
    }

    // Step 6: Size Specs
    const points = (product as any).measurement_points || [];
    if (points.length === 0) addError(6, "Minimaal 1 Meetpunt (POM)", "measurement_points");

    // Step 7: Order QTY
    const sizes = product.sizes || [];
    const totalQty = sizes.reduce((acc, s) => acc + (s.order_quantity || 0), 0);
    if (totalQty === 0) addError(7, "Orderhoeveelheid > 0", "order_quantity");

    // Step 8: Production Labels
    if (!product.author_name) addError(8, "Designer / Author Naam", "author_name");
    if (!product.fit) addError(8, "Product Fit", "fit");

    return result;
  }, [product]);
};
