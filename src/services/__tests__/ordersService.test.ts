import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ordersService } from '../ordersService';

// Mock do Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}));

describe('OrdersService', () => {
  describe('generateOrderNumber', () => {
    it('should generate unique order number with correct format', async () => {
      const orderNumber = await ordersService.generateOrderNumber();
      
      expect(orderNumber).toMatch(/^PET\d{6}[A-Z0-9]{6}$/);
      expect(orderNumber).toHaveLength(15); // PET + 6 digits + 6 chars
    });

    it('should generate different order numbers on multiple calls', async () => {
      const orderNumber1 = await ordersService.generateOrderNumber();
      const orderNumber2 = await ordersService.generateOrderNumber();
      
      expect(orderNumber1).not.toBe(orderNumber2);
    });

    it('should always start with PET prefix', async () => {
      const orderNumber = await ordersService.generateOrderNumber();
      
      expect(orderNumber.startsWith('PET')).toBe(true);
    });
  });

  describe('Basic service methods', () => {
    it('should have getOrders method', () => {
      expect(typeof ordersService.getOrders).toBe('function');
    });

    it('should have getOrder method', () => {
      expect(typeof ordersService.getOrder).toBe('function');
    });

    it('should have createOrder method', () => {
      expect(typeof ordersService.createOrder).toBe('function');
    });

    it('should have updateOrder method', () => {
      expect(typeof ordersService.updateOrder).toBe('function');
    });

    it('should have cancelOrder method', () => {
      expect(typeof ordersService.cancelOrder).toBe('function');
    });

    it('should have getOrderStats method', () => {
      expect(typeof ordersService.getOrderStats).toBe('function');
    });
  });
});