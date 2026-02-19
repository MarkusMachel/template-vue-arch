export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Errors ───────────────────────────────────────────────
export interface AppError {
  message: string;
  status: number;
  code?: string;
}

// ── Generic API response wrappers ────────────────────────
// For endpoints that wrap data in a response envelope
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// For endpoints that return just a success/failure
export interface ApiResult {
  success: boolean;
  message?: string;
}
