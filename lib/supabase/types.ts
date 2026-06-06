export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          title: string;
          description: string | null;
          price: number;
          category: string;
          condition: string | null;
          location: string;
          lat: number;
          lng: number;
          city_slug: string;
          image_url: string | null;
          seller_name: string;
          is_garage_sale: boolean;
          sale_type: string | null;
          sale_date: string | null;
          sale_date_iso: string | null;
          posted_hours_ago: number | null;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          listing_id: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          read: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          phone_verified: boolean;
          id_verified: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
  };
};
