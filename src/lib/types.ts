export type Role = 'CUSTOMER' | 'STAFF' | 'ACCOUNTANT' | 'SUPER_ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'UNISEX';
export type ProductCategory = 'SHOES' | 'LACES' | 'POLISH' | 'SOCKS';
export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  monthlySalary?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string; // backend returns string for Decimal precision
  gender: Gender;
  category: ProductCategory;
  brand: string;
  imageUrl: string | null;
  inStock: boolean;
  stockCount?: number;
  lowStockThreshold?: number;
  createdAt: string;
}

export interface CartLine {
  productId: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockCount: number;
}

export interface Cart {
  cartId: string;
  items: CartLine[];
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  shippingAddress?: ShippingAddress;
  items?: OrderItem[];
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  grandTotal: number;
  itemCount: number;
  createdAt: string;
  customerId?: string;
  customerEmail?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  userRole?: Role;
  periodMonth: number;
  periodYear: number;
  amount: number;
  notes: string | null;
  paidAt: string;
  recordedByUserId?: string;
}

export interface AuditEntry {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}
