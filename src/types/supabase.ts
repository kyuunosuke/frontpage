export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      competitions: {
        Row: {
          category: string;
          competition_url: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          difficulty: string;
          end_date: string | null;
          deadline: string | null;
          entry_difficulty: string | null;
          entry_url: string | null;
          id: string;
          image_url: string;
          prize_value: string | number;
          requirements: string;
          rules: Json | null;
          sponsor: string | null;
          start_date: string | null;
          status: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          competition_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty: string;
          end_date?: string | null;
          deadline?: string | null;
          entry_difficulty?: string | null;
          entry_url?: string | null;
          id?: string;
          image_url: string;
          prize_value: string | number;
          requirements: string;
          rules?: Json | null;
          sponsor?: string | null;
          start_date?: string | null;
          status: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          competition_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty?: string;
          end_date?: string | null;
          deadline?: string | null;
          entry_difficulty?: string | null;
          entry_url?: string | null;
          id?: string;
          image_url?: string;
          prize_value?: string | number;
          requirements?: string;
          rules?: Json | null;
          sponsor?: string | null;
          start_date?: string | null;
          status?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      competition_eligibility: {
        Row: {
          id: string;
          competition_id: string;
          criteria: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          competition_id: string;
          criteria: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          competition_id?: string;
          criteria?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competition_eligibility_competition_id_fkey";
            columns: ["competition_id"];
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
        ];
      };
      competition_requirements: {
        Row: {
          id: string;
          competition_id: string;
          requirement: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          competition_id: string;
          requirement: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          competition_id?: string;
          requirement?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competition_requirements_competition_id_fkey";
            columns: ["competition_id"];
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      saved_competitions: {
        Row: {
          id: string;
          user_id: string;
          competition_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          competition_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          competition_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saved_competitions_competition_id_fkey";
            columns: ["competition_id"];
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_competitions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
