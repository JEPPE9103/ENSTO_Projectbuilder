export type Project = {
  id: number;
  name: string;
  customer_name: string;
  country: string;
  project_type: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectCreate = {
  name: string;
  customer_name: string;
  country: string;
  project_type: string;
  notes?: string;
};

export type ProjectSystem = {
  id: number;
  project_id: number;
  system_type: string;
  title: string;
  config_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ProjectSystemItem = {
  productId: number;
  eNumber: string;
  articleNumber: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  catalogUnitPrice?: number | null;
  unitPriceOverride?: number | null;
};

export type ProjectSystemMaterial = {
  productId?: number | null;
  articleNumber: string;
  name: string;
  quantity: number;
  unit: string;
  lineTotal?: number | null;
};

export type ProjectSystemConfig = {
  notes?: string;
  items: ProjectSystemItem[];
  materials: ProjectSystemMaterial[];
};

export type Product = {
  id: number;
  e_number: string;
  article_number: string;
  name: string;
  category: string;
  series: string;
  size: string;
  color: string;
  unit: string;
  unit_price?: number | null;
  length_meters?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SystemConfiguration = {
  system_type: string;
  category: string;
  series: string;
  size: string;
  color: string;
  total_length_meters: number;
  inner_corners: number;
  outer_corners: number;
  tee_joints: number;
  end_caps: number;
  spare_percent: number;
  piece_length_meters: number;
};

export type MaterialRow = {
  product_id?: number | null;
  article_number: string;
  product_name: string;
  quantity: number;
  unit: string;
  comment?: string | null;
};

export type EstimateCalculationResult = {
  material_rows: MaterialRow[];
};

export type Estimate = {
  id: number;
  project_system_id: number;
  created_at: string;
  rows: (MaterialRow & { id: number; created_at: string })[];
};

