-- Migration: Add theme color configurations to system_settings_pet table
-- Date: 2025-01-15
-- Description: Adds administrative color system with active, default, and history configurations

-- 1. Insert active theme colors configuration
INSERT INTO system_settings_pet (key, value, description, category, is_public)
SELECT 'theme_colors_active', '{
  "primary": "#3B82F6",
  "secondary": "#10B981",
  "accent": "#F59E0B",
  "surface": "#FFFFFF",
  "text": "#1F2937",
  "header": {
    "background": "#1F2937",
    "text": "#FFFFFF",
    "border": "#374151"
  },
  "landing": {
    "hero_bg": "#F3F4F6",
    "hero_text": "#1F2937",
    "section_bg": "#FFFFFF"
  },
  "components": {
    "button_primary": "#3B82F6",
    "button_secondary": "#6B7280",
    "card_bg": "#FFFFFF",
    "card_border": "#E5E7EB"
  }
}', 'Configuração ativa das cores do tema do sistema', 'theme', true
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'theme_colors_active'
);

-- 2. Insert default theme colors configuration (backup)
INSERT INTO system_settings_pet (key, value, description, category, is_public)
SELECT 'theme_colors_default', '{
  "primary": "#3B82F6",
  "secondary": "#10B981",
  "accent": "#F59E0B",
  "surface": "#FFFFFF",
  "text": "#1F2937",
  "header": {
    "background": "#1F2937",
    "text": "#FFFFFF",
    "border": "#374151"
  },
  "landing": {
    "hero_bg": "#F3F4F6",
    "hero_text": "#1F2937",
    "section_bg": "#FFFFFF"
  },
  "components": {
    "button_primary": "#3B82F6",
    "button_secondary": "#6B7280",
    "card_bg": "#FFFFFF",
    "card_border": "#E5E7EB"
  }
}', 'Configuração padrão das cores (backup para restauração)', 'theme', false
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'theme_colors_default'
);

-- 3. Initialize theme colors history
INSERT INTO system_settings_pet (key, value, description, category, is_public)
SELECT 'theme_colors_history', '{
  "versions": [
    {
      "version": "1.0",
      "date": "' || NOW() || '",
      "admin_id": "system",
      "colors": {
        "primary": "#3B82F6",
        "secondary": "#10B981",
        "accent": "#F59E0B",
        "surface": "#FFFFFF",
        "text": "#1F2937",
        "header": {
          "background": "#1F2937",
          "text": "#FFFFFF",
          "border": "#374151"
        },
        "landing": {
          "hero_bg": "#F3F4F6",
          "hero_text": "#1F2937",
          "section_bg": "#FFFFFF"
        },
        "components": {
          "button_primary": "#3B82F6",
          "button_secondary": "#6B7280",
          "card_bg": "#FFFFFF",
          "card_border": "#E5E7EB"
        }
      },
      "description": "Configuração inicial do sistema"
    }
  ],
  "current_version": "1.0"
}', 'Histórico de versões das configurações de cores', 'theme', false
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'theme_colors_history'
);

-- 4. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_system_settings_theme_category ON system_settings_pet(category) WHERE category = 'theme';
CREATE INDEX IF NOT EXISTS idx_system_settings_theme_keys ON system_settings_pet(key) WHERE key IN ('theme_colors_active', 'theme_colors_default', 'theme_colors_history');

-- 5. Create audit trigger for theme changes
CREATE OR REPLACE FUNCTION log_theme_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log only theme-related changes
    IF NEW.category = 'theme' THEN
        INSERT INTO audit_logs_pet (
            admin_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values,
            created_at
        ) VALUES (
            COALESCE(auth.uid(), 'system'::uuid),
            TG_OP,
            'system_settings_pet',
            NEW.id::text,
            CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
            to_jsonb(NEW),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS theme_settings_audit_trigger ON system_settings_pet;
CREATE TRIGGER theme_settings_audit_trigger
    AFTER INSERT OR UPDATE ON system_settings_pet
    FOR EACH ROW
    EXECUTE FUNCTION log_theme_changes();

-- 6. Verify the migration
SELECT 
    key,
    description,
    category,
    is_public,
    created_at
FROM system_settings_pet 
WHERE category = 'theme'
ORDER BY created_at;

-- Migration completed successfully
SELECT 'Theme colors migration completed successfully' as status;