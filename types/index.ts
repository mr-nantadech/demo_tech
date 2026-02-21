export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type JobStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface QuotationRow {
  id: string;
  quotationNo: string;
  clientName: string;
  projectName: string | null;
  description: string | null;
  amount: number;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobHistoryRow {
  id: string;
  quotationId: string | null;
  jobName: string;
  clientName: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  amount: number | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  quotation?: { quotationNo: string } | null;
}

export interface MasterDataRow {
  id: string;
  category: string;
  key: string;
  value: string;
  label: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: "ร่าง",
  SENT: "ส่งแล้ว",
  APPROVED: "อนุมัติ",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  IN_PROGRESS: "กำลังดำเนินการ",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  DRAFT: "default",
  SENT: "info",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "warning",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};
