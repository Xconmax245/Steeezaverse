// Minimal Database type shim — prevents `data: never` on untyped supabase queries.
// Replace with the full generated types from `supabase gen types typescript` when ready.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      [tableName: string]: {
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
