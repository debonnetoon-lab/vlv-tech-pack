export interface AIResult {
  width_cm: number;
  height_cm: number;
  pos_under_neck_cm: number;
  technique: string;
  confidence: number;
  pixel_box: {
    left_px: number;
    top_px: number;
    right_px: number;
    bottom_px: number;
  };
  warnings: string[];
  overlay_preview_url?: string;
}

export type GarmentType = 'jersey' | 'bib_shorts' | 'jacket' | 'vest' | 'gloves' | 'socks' | 'cap' | 'skinsuit' | 'other';
export type GenderType = 'men' | 'women' | 'unisex' | 'kids';
export type FitType = 'race' | 'sport' | 'relaxed' | 'custom';
export type LabelPosition = 'neck' | 'hem' | 'sleeve' | 'inside' | 'outside' | 'none';
export type PackagingType = 'polybag' | 'hanger' | 'box' | 'custom' | 'none';

export interface PantoneColor {
  id?: string;
  pantone_code: string;
  color_name: string;
  hex_value: string;
  usage?: string;
  fabric_part?: string;
}

export interface ArtworkPlacement {
  id?: string;
  placement_name: string;
  position_x?: number;
  position_y?: number;
  width_cm: number;
  height_cm: number;
  artwork_url?: string;
  notes?: string;
  technique?: string;
  
  // Alfa Shirt / Production fields
  print_order_number?: number;     // DRUK 1, 2, etc. (Manual override)
  reference_point?: string;        // bv. Halsnaad, Zijnaad
  reference_distance?: number;     // cm vanaf referentiepunt
  tolerance_cm?: number;           // bv. 0.5
  technique_subtype?: string;      // bv. Sublimatie, DTF Transfer
  application_method?: string;     // bv. Hittepers, Carrousel
  color_ids?: string[];            // IDs of colors from article.colors
}

export interface ArticleImage {
  id?: string;
  view: 'front' | 'back' | 'detail' | 'artwork';
  storage_path: string;
  public_url: string;
  file_name?: string;
  file_size_kb?: number;
}

export interface SizeMeasurement {
  id?: string;
  size_label: string;
  chest_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  length_cm?: number;
  sleeve_cm?: number;
  inseam_cm?: number;
  order_quantity?: number;
}

export interface TechPackArticle {
  id: string;
  collection_id: string;
  reference_code: string;
  product_name: string;
  garment_type: GarmentType;
  gender: GenderType;
  fit: FitType;
  brand: string;
  customer_po?: string;            // External Order Number
  disclaimer_enabled?: boolean;    // Toggle disclaimer on PDF
  disclaimer_text?: string;       // Custom disclaimer text
  season?: string;
  year?: number;
  description?: string;
  
  // Step 1 - Fabric
  fabric_main?: string;
  fabric_secondary?: string;
  weight_gsm?: number;

  // Step 6 - Label
  label_type?: string;
  label_position: LabelPosition;
  label_content?: string;

  // Step 7 - Packaging
  packaging: PackagingType;
  packaging_notes?: string;

  // Status & Metadata
  status: 'draft' | 'review' | 'approved';
  version: string;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Relational data (mapped for frontend convenience)
  sizes: SizeMeasurement[];
  placements: ArtworkPlacement[];
  colors: PantoneColor[];
  images: ArticleImage[];
  
  // AI Results (stored in articles table as JSONB or separate)
  ai_measurement?: AIResult;
}

export interface Collection {
  id: string;
  name: string;
  season?: string;
  year?: number;
  description?: string;
  articles: TechPackArticle[];
}
