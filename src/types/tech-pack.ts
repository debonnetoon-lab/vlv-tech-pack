export type GarmentType = 'jersey' | 'bib_shorts' | 'jacket' | 'vest' | 'gloves' | 'socks' | 'cap' | 'skinsuit' | 'other';
export type GenderType = 'men' | 'women' | 'unisex' | 'kids';
export type ProductStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export interface ProductImage {
  id: string;
  product_id: string;
  view: 'front' | 'back' | 'detail' | 'artwork';
  storage_path: string;
  public_url: string;
  file_name?: string;
}

export interface BOMItem {
  id: string;
  product_id: string;
  category?: string;
  component: string;
  description: string;
  supplier: string;
  unit: string;
  quantity: number;
  unit_price: number;
  currency: string;
  total_price?: number;
}

export interface MeasurementPoint {
  id: string;
  product_id: string;
  label: string;
  description?: string;
  tolerance?: string;
  values: MeasurementValue[];
}

export interface MeasurementValue {
  id: string;
  point_id: string;
  size_label: string;
  value_cm: number;
}

export interface SizeMeasurement {
  size_label: string;
  order_quantity?: number;
}

export interface ArtworkPlacement {
  id?: string;
  product_id?: string;
  placement_name: string;
  position_x?: number;
  position_y?: number;
  width_cm: number;
  height_cm: number;
  artwork_url?: string;
  technique?: string;
  technique_sub?: string;
  technique_subtype?: string;
  application_method?: string;
  notes?: string;
  reference_point?: string;
  reference_distance?: number;
  print_order_number?: number;
  tolerance_cm?: number;
  pantone_colors?: string[];
  color_ids?: string[];
}

export interface Colorway {
  id: string;
  product_id: string;
  name: string;
  pantone_code?: string;
  hex_code?: string;
  image_url?: string;
  color_name?: string; // used in some components
}

export interface AIResult {
  sku: string;
  garment_type: string;
  flat_width_cm: number;
  flat_width_px: number;
  scale_factor: number;
  print: {
    width_cm: number;
    height_cm: number;
    pos_under_neck_cm: number;
    technique: string;
    tolerances_mm: number;
    confidence: number;
  };
  pixel_box: {
    left_px: number;
    top_px: number;
    right_px: number;
    bottom_px: number;
  };
  warnings: string[];
}

export interface TechPackProduct {
  id: string;
  collection_id: string;
  organization_id: string;
  name: string;
  product_name?: string; // used in some components
  article_code: string;
  category: string;
  gender: GenderType;
  status: ProductStatus;
  description?: string;
  
  // Production Details
  customer_po?: string;
  garment_type?: GarmentType;
  fabric_main?: string;
  fabric_secondary?: string;
  weight_gsm?: number;
  ai_measurement?: AIResult;
  fit?: string;
  label_type?: string;
  label_position?: string;
  packaging?: string;
  packaging_notes?: string;
  disclaimer_enabled?: boolean;
  disclaimer_text?: string;
  author_name?: string;
  
  // Relations
  images?: ProductImage[];
  bom_items?: BOMItem[];
  measurement_points?: MeasurementPoint[];
  placements?: ArtworkPlacement[];
  colorways?: Colorway[];
  materials?: any[]; // Added for wizard compatibility
  sizes?: SizeMeasurement[];
  order_quantities?: Record<string, number>;
  
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  email?: string;
  website?: string;
}

export interface Collection {
  id: string;
  organization_id: string;
  name: string;
  season?: string;
  year?: number;
  status: 'draft' | 'active' | 'archived';
  cover_image_url?: string;
  products: TechPackProduct[];
}
