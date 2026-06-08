
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum PlanType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  planId?: string;
  planName?: string;
  transferCount?: number;
  ban?: boolean;
  customRole?: string;
}

export interface Software {
  id: string;
  name: string;
  version: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  fileUrl: string; // Mock URL
  imageUrl: string;
  category: string;
  // New Technical Fields
  platform: 'Windows' | 'MacOS' | 'Linux' | 'Cross-Platform';
  fileSize: string;
  requirements: string;
}

export interface ElectronicsItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  stock: number;
}

export interface CartItem extends ElectronicsItem {
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type RefundStatus = 'NONE' | 'PENDING' | 'COMPLETED';

export interface Order {
  id: string;
  userId: string;
  userEmail: string; // Snapshot for admin display
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  refundStatus?: RefundStatus;
  date: string; // ISO Date
  shippingAddress: string;
  paymentMethod: 'PAYTM' | 'CARD';
  paymentId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  softwareId: string;
  plan: PlanType;
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  amountPaid: number;
}

export interface License {
  id: string;
  key: string;
  userId: string;
  softwareId: string;
  subscriptionId: string;
  expiryDate: string; // ISO Date
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CompanySettings {
  address: string;
  email: string;
  phone: string;
  hours: string;
}

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  date: string; // ISO Date
  read: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number; // e.g., 20 for 20% or 10 for $10
  targetType: 'ALL' | 'SOFTWARE' | 'ELECTRONICS';
  targetId?: string; // Optional: ID of specific item. If null, applies to all in category.
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
}

export interface DownloadRecord {
  id: string;
  userId: string;
  softwareId?: string;
  softwareName: string;
  fileName: string;
  version: string;
  size: string;
  date: string;
  status: 'COMPLETED' | 'FAILED' | 'SCANNED';
  securityScanResult: 'CLEAN' | 'THREAT_DETECTED';
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description?: string;
  tags: string[];
  isActive: boolean;
}

export interface NewsUpdate {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  date: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  clicks: number;
  loginRequired?: boolean;
  premiumRequired?: boolean;
  allowedPlans?: string[]; // Array of Plan IDs or Plan Names
}

export interface BusinessPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceLifetime: number;
  transferLimit: number;
  storageLimit: string;
  toolAccess: string[]; // Allowed tool IDs
  premiumFeatures: string[];
  trialDays: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SystemSettings {
  siteName: string;
  branding: string;
  logo: string;
  themeColor: string;
  contactEmail: string;
  supportLink: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  loginEnabled: boolean;
  defaultPlanId: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  enabled: boolean;
  description: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

