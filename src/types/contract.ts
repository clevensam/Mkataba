export interface Field {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "signature";
  required?: boolean;
}

export interface Template {
  id?: string;
  title: string;
  category: string;
  language: string;
  description: string;
  htmlContent: string;
  fields: string;
  published: boolean;
  createdAt?: unknown;
}

export interface Sharing {
  enabled: boolean;
  permission: "view" | "edit";
}

export interface Contract {
  id?: string;
  userId: string;
  templateId: string;
  filledData: string;
  signatureDataUrl: string | null;
  signaturePosition: { x: number; y: number };
  status: "draft" | "signed";
  sharing: Sharing;
  createdAt?: unknown;
  updatedAt?: unknown;
}