/**
 * Bookings API Service
 * Handles all booking-related API calls to Django backend
 */

import { apiClient, formatApiError } from './client';
import type { Booking } from '@/lib/api/types';

/**
 * Get user's bookings
 */
export async function getUserBookings(): Promise<Booking[]> {
  try {
    const response = await apiClient.get<Booking[]>('/bookings/');
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Get specific booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking> {
  try {
    const response = await apiClient.get<Booking>(`/bookings/${bookingId}/`);
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Create a new booking
 */
export async function createBooking(data: {
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  insurance?: boolean;
  notes?: string;
}): Promise<Booking> {
  try {
    const response = await apiClient.post<Booking>('/bookings/', data);
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<Booking> {
  try {
    const response = await apiClient.post<Booking>(
      `/bookings/${bookingId}/cancel/`,
      {}
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Update booking (modify dates, location, etc.)
 */
export async function updateBooking(
  bookingId: string,
  data: Partial<Booking>
): Promise<Booking> {
  try {
    const response = await apiClient.patch<Booking>(
      `/bookings/${bookingId}/`,
      data
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Get booking cost breakdown
 */
export async function getBookingCostBreakdown(bookingId: string): Promise<{
  base_cost: number;
  insurance_cost: number;
  additional_fees: number;
  total: number;
}> {
  try {
    const response = await apiClient.get(
      `/bookings/${bookingId}/cost-breakdown/`
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Initiate M-Pesa payment for booking
 */
export async function initiatePayment(bookingId: string): Promise<{
  checkout_request_id: string;
  response_code: string;
  response_description: string;
}> {
  try {
    const response = await apiClient.post(
      `/bookings/${bookingId}/initiate-payment/`,
      {}
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(
  checkoutRequestId: string
): Promise<{
  booking_id: string;
  status: 'pending' | 'success' | 'failed';
  mpesa_receipt_number?: string;
}> {
  try {
    const response = await apiClient.get(
      `/bookings/payment-status/${checkoutRequestId}/`
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}