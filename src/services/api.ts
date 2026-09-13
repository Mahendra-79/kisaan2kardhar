import {
  User,
  ProduceListing,
  Order,
  BuyerRequirement,
  FpoMember,
  FpoAggregation,
  MarketPrice,
  DemandPrediction,
  AppNotification,
  AdminStats
} from '../types';

export function calculateLogisticsCharge(distanceKm: number): number {
  if (distanceKm <= 3) return 20;
  if (distanceKm <= 5) return 30;
  if (distanceKm <= 10) return 50;
  if (distanceKm <= 15) return 80;
  return 100;
}

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(payload: { email?: string; role: string; adminPassKey?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/auth/users`);
    return handleResponse(res);
  },

  // Produce
  async getProduce(params?: { farmerId?: string; product?: string; maxDistance?: number }): Promise<ProduceListing[]> {
    const query = new URLSearchParams();
    if (params?.farmerId) query.append('farmerId', params.farmerId);
    if (params?.product) query.append('product', params.product);
    if (params?.maxDistance) query.append('maxDistance', String(params.maxDistance));
    
    const res = await fetch(`${BASE_URL}/produce?${query.toString()}`);
    return handleResponse(res);
  },

  async addProduce(listing: Partial<ProduceListing>): Promise<ProduceListing> {
    const res = await fetch(`${BASE_URL}/produce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });
    return handleResponse(res);
  },

  async updateProduce(id: string, updates: Partial<ProduceListing>): Promise<ProduceListing> {
    const res = await fetch(`${BASE_URL}/produce/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteProduce(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/produce/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Orders
  async getOrders(params?: { customerId?: string; farmerId?: string; logisticsId?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.farmerId) query.append('farmerId', params.farmerId);
    if (params?.logisticsId) query.append('logisticsId', params.logisticsId);

    const res = await fetch(`${BASE_URL}/orders?${query.toString()}`);
    return handleResponse(res);
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    return handleResponse(res);
  },

  async createOrder(orderData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerDeliveryLocation: string;
    productId: string;
    quantity: number;
    paymentMethod: string;
  }): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },

  async updateOrderStatus(orderId: string, status: Order['orderStatus'], actorRole: string = 'logisticsProvider', note?: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actorRole, note })
    });
    return handleResponse(res);
  },

  // FPO
  async getFpoMembers(fpoId?: string): Promise<FpoMember[]> {
    const query = fpoId ? `?fpoId=${fpoId}` : '';
    const res = await fetch(`${BASE_URL}/fpo/members${query}`);
    return handleResponse(res);
  },

  async addFpoMember(member: Partial<FpoMember>): Promise<FpoMember> {
    const res = await fetch(`${BASE_URL}/fpo/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    return handleResponse(res);
  },

  async getFpoAggregations(fpoId: string = 'fpo-1'): Promise<FpoAggregation[]> {
    const res = await fetch(`${BASE_URL}/fpo/aggregations?fpoId=${fpoId}`);
    return handleResponse(res);
  },

  // Bulk Buyers
  async getBuyerRequirements(): Promise<BuyerRequirement[]> {
    const res = await fetch(`${BASE_URL}/bulk/requirements`);
    return handleResponse(res);
  },

  async addBuyerRequirement(reqData: Partial<BuyerRequirement>): Promise<BuyerRequirement> {
    const res = await fetch(`${BASE_URL}/bulk/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqData)
    });
    return handleResponse(res);
  },

  async getRequirementMatches(reqId: string): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/bulk/requirements/${reqId}/matches`);
    return handleResponse(res);
  },

  // Logistics
  async getLogisticsEarnings(providerId: string = 'logistics-1'): Promise<{
    providerId: string;
    name: string;
    vehicleType: string;
    vehicleNumber: string;
    completedOrders: number;
    totalEarnings: number;
    deliveredOrders: Order[];
  }> {
    const res = await fetch(`${BASE_URL}/logistics/earnings/${providerId}`);
    return handleResponse(res);
  },

  async getRouteOptimization(orderId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/logistics/route-optimization/${orderId}`);
    return handleResponse(res);
  },

  // Market & AI Demand Forecast
  async getMarketPrices(): Promise<MarketPrice[]> {
    const res = await fetch(`${BASE_URL}/market-prices`);
    return handleResponse(res);
  },

  async getDemandForecast(product: string = 'Tomato', location?: string, recentPrice?: number): Promise<DemandPrediction> {
    const query = new URLSearchParams();
    query.append('product', product);
    if (location) query.append('location', location);
    if (recentPrice) query.append('recentPrice', String(recentPrice));
    
    const res = await fetch(`${BASE_URL}/demand-forecast?${query.toString()}`);
    return handleResponse(res);
  },

  // User Profile & Management
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<{ user: User; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Bulk Procurement
  async procureBulkLot(payload: {
    buyerId?: string;
    buyerName?: string;
    buyerPhone?: string;
    requirementId?: string;
    supplierId: string;
    supplierName: string;
    supplierType: string;
    product: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    deliveryLocation: string;
    paymentTerms: string;
  }): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch(`${BASE_URL}/bulk/procure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(userId?: string, role?: string): Promise<AppNotification[]> {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (role) query.append('role', role);
    const res = await fetch(`${BASE_URL}/notifications?${query.toString()}`);
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    return handleResponse(res);
  },

  async getAdminData(): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/data`);
    return handleResponse(res);
  }
};
