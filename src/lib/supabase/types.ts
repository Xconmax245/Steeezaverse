// Minimal Database type shim — prevents `data: never` on untyped supabase queries.
// Replace with the full generated types from `supabase gen types typescript` when ready.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      discounts: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
      orders: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
      inventory_log: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
      waitlist_signups: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
      notification_log: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
      products: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
    };
    Views: {
      [viewName: string]: {
        Row: Record<string, Json>;
      };
    };
    Functions: {
      [fnName: string]: {
        Args: Record<string, Json>;
        Returns: Json;
      };
    };
  };
}
