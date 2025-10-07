-- Supabase Functions for Verification & Subscription Dashboard

-- Function to get complete user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
    dashboard_data JSON;
    user_data JSON;
    verification_data JSON;
    subscription_data JSON;
    wallet_data JSON;
    orders_data JSON;
    qr_history JSON;
    insights_data JSON;
    notifications_data JSON;
BEGIN
    -- Get user basic info
    SELECT json_build_object(
        'id', u.id,
        'user_id', u.user_id,
        'full_name', u.full_name,
        'email', u.email,
        'phone', u.phone,
        'user_role', u.user_role,
        'tier', u.tier,
        'verification_status', u.verification_status,
        'reputation_score', u.reputation_score,
        'membership_tier', u.membership_tier
    ) INTO user_data
    FROM users u
    WHERE u.user_id = p_user_id;

    -- Get verification info
    SELECT json_build_object(
        'status', COALESCE(u.verification_status, 'unverified'),
        'tier', COALESCE(u.tier, 'none'),
        'progress', CASE 
            WHEN u.verification_status = 'unverified' THEN 0
            WHEN u.verification_status = 'ai_verified' THEN 30
            WHEN u.verification_status = 'human_verified' THEN 70
            WHEN u.verification_status = 'qr_verified' THEN 85
            WHEN u.verification_status = 'admin_approved' THEN 100
            ELSE 0
        END,
        'documents', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', vd.id,
                    'type', vd.document_type,
                    'status', vd.status,
                    'uploaded_at', vd.created_at
                )
            ) FROM verification_documents vd WHERE vd.user_id = p_user_id),
            '[]'::json
        )
    ) INTO verification_data
    FROM users u
    WHERE u.user_id = p_user_id;

    -- Get subscription info
    SELECT json_build_object(
        'current_tier', COALESCE(st.tier_name, 'Basic'),
        'tier_level', COALESCE(st.tier_level, 1),
        'status', COALESCE(us.status, 'none'),
        'start_date', us.start_date,
        'end_date', us.end_date,
        'features', COALESCE(st.features, '{}'),
        'limits', COALESCE(st.limits, '{}'),
        'auto_renew', COALESCE(us.auto_renew, false)
    ) INTO subscription_data
    FROM users u
    LEFT JOIN user_subscriptions us ON u.user_id = us.user_id AND us.status = 'active'
    LEFT JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE u.user_id = p_user_id;

    -- Get wallet info
    SELECT json_build_object(
        'trading_balance', COALESCE(w.trading_balance, 0),
        'savings_balance', COALESCE(w.savings_balance, 0),
        'reserve_balance', COALESCE(w.reserve_balance, 0),
        'total_earned', COALESCE(w.total_earned, 0),
        'total_spent', COALESCE(w.total_spent, 0),
        'recent_transactions', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', wt.id,
                    'type', wt.type,
                    'amount', wt.amount,
                    'status', wt.status,
                    'description', wt.description,
                    'created_at', wt.created_at
                )
            ) FROM wallet_transactions wt 
            WHERE wt.user_id = p_user_id 
            ORDER BY wt.created_at DESC 
            LIMIT 5),
            '[]'::json
        )
    ) INTO wallet_data
    FROM wallet w
    WHERE w.user_id = p_user_id;

    -- Get active orders
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', o.id,
                'status', o.status,
                'total_amount', o.total_amount,
                'created_at', o.created_at,
                'product_name', p.name
            )
        ),
        '[]'::json
    ) INTO orders_data
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE (o.buyer_id = p_user_id OR o.seller_id = p_user_id)
    AND o.status NOT IN ('delivered', 'cancelled')
    ORDER BY o.created_at DESC
    LIMIT 10;

    -- Get QR scan history
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', qsl.id,
                'qr_type', qsl.qr_type,
                'scan_result', qsl.scan_result,
                'created_at', qsl.created_at
            )
        ),
        '[]'::json
    ) INTO qr_history
    FROM qr_scan_logs qsl
    WHERE qsl.user_id = p_user_id
    ORDER BY qsl.created_at DESC
    LIMIT 10;

    -- Get market insights (personalized based on user's tier)
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', mi.id,
                'category', mi.category,
                'product_name', mi.product_name,
                'current_price', mi.current_price,
                'trend', mi.trend,
                'ai_recommendation', mi.ai_recommendation
            )
        ),
        '[]'::json
    ) INTO insights_data
    FROM market_insights mi
    ORDER BY mi.created_at DESC
    LIMIT 5;

    -- Get notifications
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', n.id,
                'title', n.title,
                'message', n.message,
                'type', n.type,
                'is_read', n.is_read,
                'created_at', n.created_at
            )
        ),
        '[]'::json
    ) INTO notifications_data
    FROM notifications n
    WHERE n.user_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT 10;

    -- Build complete dashboard response
    dashboard_data := json_build_object(
        'user', user_data,
        'verification', verification_data,
        'subscription', subscription_data,
        'wallet', wallet_data,
        'active_orders', orders_data,
        'qr_history', qr_history,
        'market_insights', insights_data,
        'notifications', notifications_data
    );

    RETURN dashboard_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update verification documents
CREATE OR REPLACE FUNCTION update_verification_documents(
    p_user_id TEXT,
    p_documents JSONB
)
RETURNS JSON AS $$
DECLARE
    doc JSONB;
    result JSON;
BEGIN
    -- Loop through documents and insert/update
    FOR doc IN SELECT * FROM jsonb_array_elements(p_documents)
    LOOP
        INSERT INTO verification_documents (
            user_id,
            document_type,
            document_url,
            document_number,
            status
        ) VALUES (
            p_user_id,
            doc->>'type',
            doc->>'url',
            doc->>'number',
            'pending'
        )
        ON CONFLICT (user_id, document_type) 
        DO UPDATE SET
            document_url = EXCLUDED.document_url,
            document_number = EXCLUDED.document_number,
            status = 'pending',
            updated_at = NOW();
    END LOOP;

    -- Update user verification status
    UPDATE users 
    SET verification_status = 'ai_verified',
        updated_at = NOW()
    WHERE user_id = p_user_id;

    result := json_build_object(
        'success', true,
        'message', 'Verification documents updated successfully'
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade subscription
CREATE OR REPLACE FUNCTION upgrade_subscription(
    p_user_id TEXT,
    p_tier_name TEXT,
    p_payment_method TEXT DEFAULT 'wallet'
)
RETURNS JSON AS $$
DECLARE
    tier_info RECORD;
    user_wallet RECORD;
    subscription_cost DECIMAL(10,2);
    result JSON;
BEGIN
    -- Get tier information
    SELECT * INTO tier_info
    FROM subscription_tiers
    WHERE tier_name = p_tier_name AND is_active = true;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid subscription tier'
        );
    END IF;

    subscription_cost := tier_info.monthly_price;

    -- Check wallet balance if paying with wallet
    IF p_payment_method = 'wallet' THEN
        SELECT * INTO user_wallet
        FROM wallet
        WHERE user_id = p_user_id;

        IF user_wallet.trading_balance < subscription_cost THEN
            RETURN json_build_object(
                'success', false,
                'message', 'Insufficient wallet balance'
            );
        END IF;

        -- Deduct from wallet
        UPDATE wallet
        SET trading_balance = trading_balance - subscription_cost,
            total_spent = total_spent + subscription_cost,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Record transaction
        INSERT INTO wallet_transactions (
            user_id,
            transaction_id,
            type,
            amount,
            balance_type,
            status,
            payment_method,
            description
        ) VALUES (
            p_user_id,
            'SUB_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8),
            'subscription',
            subscription_cost,
            'trading',
            'completed',
            'wallet',
            'Subscription upgrade to ' || p_tier_name
        );
    END IF;

    -- Cancel existing active subscription
    UPDATE user_subscriptions
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = p_user_id AND status = 'active';

    -- Create new subscription
    INSERT INTO user_subscriptions (
        user_id,
        tier_id,
        start_date,
        end_date,
        status,
        payment_method,
        amount_paid
    ) VALUES (
        p_user_id,
        tier_info.id,
        NOW(),
        NOW() + INTERVAL '1 month',
        'active',
        p_payment_method,
        subscription_cost
    );

    -- Update user tier
    UPDATE users
    SET tier = p_tier_name::user_tier,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    result := json_build_object(
        'success', true,
        'message', 'Subscription upgraded successfully to ' || p_tier_name,
        'new_tier', p_tier_name,
        'amount_paid', subscription_cost
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get market insights with AI recommendations
CREATE OR REPLACE FUNCTION get_market_insights(
    p_user_id TEXT,
    p_category TEXT DEFAULT NULL,
    p_region TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    user_tier TEXT;
    insights JSON;
BEGIN
    -- Get user tier for personalized insights
    SELECT tier INTO user_tier
    FROM users
    WHERE user_id = p_user_id;

    -- Get insights based on filters
    SELECT json_agg(
        json_build_object(
            'id', mi.id,
            'category', mi.category,
            'product_name', mi.product_name,
            'region', mi.region,
            'current_price', mi.current_price,
            'previous_price', mi.previous_price,
            'trend', mi.trend,
            'demand_level', mi.demand_level,
            'supply_level', mi.supply_level,
            'forecast', mi.forecast,
            'ai_recommendation', CASE 
                WHEN user_tier IN ('gold', 'premium') THEN mi.ai_recommendation
                ELSE 'Upgrade to Gold tier for AI recommendations'
            END,
            'created_at', mi.created_at
        )
    ) INTO insights
    FROM market_insights mi
    WHERE (p_category IS NULL OR mi.category = p_category)
    AND (p_region IS NULL OR mi.region = p_region)
    ORDER BY mi.created_at DESC
    LIMIT CASE 
        WHEN user_tier = 'premium' THEN 50
        WHEN user_tier = 'gold' THEN 20
        WHEN user_tier = 'verified' THEN 10
        ELSE 5
    END;

    RETURN COALESCE(insights, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log QR scan
CREATE OR REPLACE FUNCTION log_qr_scan(
    p_user_id TEXT,
    p_qr_type TEXT,
    p_qr_data TEXT,
    p_scan_result TEXT,
    p_location JSONB DEFAULT NULL,
    p_device_info TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    INSERT INTO qr_scan_logs (
        user_id,
        qr_type,
        qr_data,
        scan_result,
        location,
        device_info
    ) VALUES (
        p_user_id,
        p_qr_type,
        p_qr_data,
        p_scan_result,
        p_location,
        p_device_info
    );

    RETURN json_build_object(
        'success', true,
        'message', 'QR scan logged successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send notification/alert
CREATE OR REPLACE FUNCTION send_user_alert(
    p_user_id TEXT,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        data
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_data
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Alert sent successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user transactions
CREATE OR REPLACE FUNCTION get_user_transactions(
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    transactions JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', wt.id,
            'transaction_id', wt.transaction_id,
            'type', wt.type,
            'amount', wt.amount,
            'balance_type', wt.balance_type,
            'status', wt.status,
            'payment_method', wt.payment_method,
            'description', wt.description,
            'created_at', wt.created_at
        )
    ) INTO transactions
    FROM wallet_transactions wt
    WHERE wt.user_id = p_user_id
    ORDER BY wt.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;

    RETURN COALESCE(transactions, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_dashboard(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_verification_documents(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upgrade_subscription(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_market_insights(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_qr_scan(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION send_user_alert(TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_transactions(TEXT, INTEGER, INTEGER) TO anon, authenticated;