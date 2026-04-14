export interface ApiResponseMeta {
  request_id: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
  meta: ApiResponseMeta;
}

export interface CopyBlock {
  id: string;
  source_form: string;
  target_form: string;
  target_field: string;
  label: string;
  text: string;
  char_limit: number;
  style_profile: string;
  review_required: boolean;
  status: "DRAFT" | "REVIEWED" | "APPROVED";
}

export interface DocumentGenerationResponse {
  copy_blocks: CopyBlock[];
}

export enum DocumentType {
  FORM_10_CASE_INTAKE = "FORM_10_CASE_INTAKE",
  FORM_12 = "FORM_12_INVESTIGATION_REPORT",
  FORM_18 = "FORM_18_COMMITTEE_REVIEW_RESULT",
  FORM_19 = "FORM_19_COMMITTEE_CLOSURE_RESULT",
  FORM_20 = "FORM_20_SELF_RESOLUTION_CONSENT",
  FORM_21 = "FORM_21_SELF_RESOLUTION_RESULT",
  FORM_22 = "FORM_22_FINAL_CASE_SUMMARY",
}
