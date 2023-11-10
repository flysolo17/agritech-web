export interface Payment {
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  details?: PaymentDetails | null;
}
export enum PaymentType {
  COD,
  GCASH,
  PAY_IN_COUNTER,
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

interface PaymentDetails {
  confirmedBy: string;
  reference: string;
  attachmentURL: string;
  createdAt: Date;
}
