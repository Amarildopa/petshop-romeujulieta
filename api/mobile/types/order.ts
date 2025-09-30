import { Product, ProductVariant } from './product';
import { User, Address } from './user';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  notes?: string;
  trackingCode?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number;
  notes?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
  notes?: string;
}

export interface UpdateCartItemData {
  quantity: number;
  notes?: string;
}

export interface CreateOrderData {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethodId: string;
  shippingMethodId: string;
  notes?: string;
  couponCode?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'wallet';
  name: string;
  details: {
    [key: string]: unknown;
  };
  isDefault: boolean;
  createdAt: Date;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  estimatedDays: number;
  trackingAvailable: boolean;
  isActive: boolean;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type ShippingStatus = 
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface OrderFilter {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  shippingStatus?: ShippingStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  filter?: OrderFilter;
  sort?: {
    field: 'createdAt' | 'total' | 'status';
    direction: 'asc' | 'desc';
  };
}

export interface OrderTracking {
  orderId: string;
  trackingCode: string;
  status: ShippingStatus;
  events: TrackingEvent[];
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export interface TrackingEvent {
  id: string;
  status: ShippingStatus;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  validFrom: Date;
  validTo: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export interface ApplyCouponData {
  code: string;
}

export interface ShippingCalculation {
  zipCode: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}