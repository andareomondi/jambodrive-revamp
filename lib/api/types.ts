/**
 * Backend Models & Response Types
 * Maps to Django models in cosmara_backend
 */

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface CustomUser {
  id: number;
  email: string;
  first_name: string;
  second_name: string;
  is_active: boolean;
}

export interface Profile {
  id: string; // UUID
  role: "customer" | "admin" | "super_admin" | "facilitator";
  full_name: string | null;
  phone: string | null;
  total_bookings: number | null;
  join_date: string; // ISO datetime
  profile_image?: string | null;
}

export interface AuthUser extends CustomUser {
  profile: Profile;
}

// ============================================================================
// AUTH RESPONSE TYPES
// ============================================================================

export interface LoginResponse {
  user: AuthUser;
  token: string;
  message: string;
}

export interface RegisterResponse {
  user: CustomUser;
  token: string;
  message: string;
}

export interface CurrentUserResponse {
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  [key: string]: string[] | string; // Field-specific errors or general error
  detail?: string;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// CAR & BOOKING TYPES (For Future Use)
// ============================================================================

export interface Car {
  id: string; // UUID
  name: string;
  model: string;
  year: number;
  price: string; // Decimal as string from API
  rating: number;
  reviews: number;
  primary_image: string | null;
  car_images: string[];
  car_type: "sedan" | "suv" | "coupe" | "hatchback" | "truck" | null;
  seats: number;
  transmission: "manual" | "automatic";
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  features: string[];
  available: boolean;
  chauffered: boolean;
}

export interface CarDetail extends Car {
  fuel_consumption: string | null;
  description: string | null;
  car_reviews: Review[];
  price_per_day: string;
}

export interface Booking {
  id: string; // UUID
  car: Car;
  car_details?: Car;
  profile: string; // UUID
  profile_details?: Profile;
  pickup_date: string; // ISO datetime
  return_date: string; // ISO datetime
  pickup_location: string;
  return_location: string;
  days: number;
  total_price: string; // Decimal as string
  paid_amount: string | null;
  insurance: boolean;
  additional_features: string[];
  status: "pending" | "confirmed" | "completed" | "cancelled" | "failed";
  created_at: string; // ISO datetime
}

export interface BookingDetail extends Booking {
  mpesa_phone: string | null;
  checkout_request_id: string | null;
  facilitator_checkout_id: string | null;
  mpesa_receipt_number: string | null;
  mpesa_transaction_date: string | null;
  additional_fee_status: string | null;
  additional_fee_amount: string | null;
  payment_failure_reason: string | null;
  notes: string | null;
}

export interface Review {
  id: string; // UUID
  car: string; // UUID
  profile: string; // UUID
  profile_name: string;
  rating: number; // 1-5
  title: string | null;
  comment: string | null;
  date: string; // ISO datetime
}

export interface GalleryEvent {
  id: string; // UUID
  title: string;
  description: string | null;
  event_date: string | null; // ISO date
  image_url: string;
  created_at: string; // ISO datetime
}

export interface SupportRequest {
  id: number;
  subject: string | null;
  category: string | null;
  message: string;
  created_at: string; // ISO datetime
}

// ============================================================================
// REQUEST PAYLOAD TYPES
// ============================================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  second_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface CreateBookingPayload {
  car: string; // UUID
  pickup_date: string; // ISO datetime
  return_date: string; // ISO datetime
  pickup_location: string;
  return_location: string;
  insurance: boolean;
  additional_features: string[];
}

export interface CreateReviewPayload {
  car: string; // UUID
  rating: number; // 1-5
  title?: string;
  comment?: string;
}

export interface CreateSupportRequestPayload {
  subject?: string;
  category?: string;
  message: string;
}

// ============================================================================
// API PAGINATION (If implemented)
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}
