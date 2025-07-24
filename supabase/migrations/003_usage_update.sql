-- Update usage table structure
ALTER TABLE usage DROP COLUMN IF EXISTS tokens_used;
ALTER TABLE usage DROP COLUMN IF EXISTS workspace_id;

ALTER TABLE usage ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage ADD COLUMN IF NOT EXISTS completion_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage ADD COLUMN IF NOT EXISTS total_tokens INTEGER NOT NULL DEFAULT 0;

-- Update cost column precision
ALTER TABLE usage ALTER COLUMN cost TYPE DECIMAL(10, 6);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_usage_user_created ON usage(user_id, created_at DESC);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own usage" ON usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON usage;

CREATE POLICY "Users can view their own usage" ON usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON usage
    FOR INSERT WITH CHECK (true);

-- Create function to get usage summary
CREATE OR REPLACE FUNCTION get_usage_summary(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_tokens BIGINT,
    total_cost DECIMAL,
    chat_count BIGINT,
    avg_tokens_per_chat BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total_tokens), 0)::BIGINT as total_tokens,
        COALESCE(SUM(cost), 0)::DECIMAL as total_cost,
        COUNT(*)::BIGINT as chat_count,
        CASE 
            WHEN COUNT(*) > 0 THEN (SUM(total_tokens) / COUNT(*))::BIGINT
            ELSE 0
        END as avg_tokens_per_chat
    FROM usage
    WHERE user_id = p_user_id
        AND created_at >= p_start_date
        AND created_at <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;