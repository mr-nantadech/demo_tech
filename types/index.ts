export type JobStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type QuoteRequestStatus = "NEW" | "IN_PROGRESS" | "REPLIED" | "CLOSED";

export interface JobHistoryRow {
  id: string;
  jobName: string;
  clientName: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  amount: number | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
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

export interface QuoteRequestRow {
  id: string;
  contactName: string;
  companyName: string | null;
  phone: string;
  email: string | null;
  serviceType: string;
  details: string;
  internalNote: string | null;
  followUpAt: string | null;
  status: QuoteRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  IN_PROGRESS: "กำลังดำเนินการ",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};

export const QUOTE_REQUEST_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  NEW: "ใหม่",
  IN_PROGRESS: "กำลังติดตาม",
  REPLIED: "ตอบกลับแล้ว",
  CLOSED: "ปิดงาน",
};

export const QUOTE_REQUEST_STATUS_COLORS: Record<QuoteRequestStatus, string> = {
  NEW: "warning",
  IN_PROGRESS: "info",
  REPLIED: "success",
  CLOSED: "default",
};

export type ProjectFileStatus = "DRAFT" | "CONFIRMED" | "APPROVED";
export type ProjectFileLineType = "SECTION" | "ITEM" | "NOTE";

export interface ProjectFileLineRow {
  id?: string;
  sortOrder: number;
  lineType: ProjectFileLineType;
  itemNo: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  materialUnitPrice: number | null;
  materialAmount: number | null;
  laborUnitPrice: number | null;
  laborAmount: number | null;
  lineTotal: number | null;
  remark: string | null;
}

export interface ProjectFileRow {
  id: string;
  projectCode: string;
  projectName: string;
  subject: string | null;
  quotationNo: string | null;
  revisionNo: string;
  quotationDate: string | null;
  customerName: string | null;
  billTo: string | null;
  dear: string | null;
  supervisorName: string | null;
  paymentTermsText: string | null;
  amountTextTh: string | null;
  status: ProjectFileStatus;
  subtotal: number;
  overheadPercent: number;
  overheadAmount: number;
  total: number;
  discount: number;
  grandTotal: number;
  lines: ProjectFileLineRow[];
  versions?: { id: string; versionNo: number; pdfPath: string | null; createdAt: string }[];
  createdAt?: string;
  updatedAt?: string;
}
