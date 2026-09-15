export interface Category {
  id: string;
  organisation_id: string;
  branch_id: string | null;
  parent_id: string | null;
  name: string;
  category_code: string;
  full_code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateCategoryRequest {
  organisation_id: string;
  branch_id: string;
  name: string;
  description: string;
  is_active: boolean;
  parent_id: string;
}
