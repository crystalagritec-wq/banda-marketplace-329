-- Banda Loyalty & Gamification System Schema
-- Run this in your Supabase SQL Editor

-- =====================================================
-- LOYALTY POINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);

-- =====================================================
-- LOYALTY TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('purchase', 'referral', 'review', 'streak', 'challenge')),
  points INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_event_type ON loyalty_transactions(event_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  order_id TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =====================================================
-- REVIEW REPLIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_vendor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster review lookups
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);

-- =====================================================
-- REFERRALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id TEXT NOT NULL,
  referred_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- =====================================================
-- CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'referral', 'review', 'streak', 'challenge')),
  target INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active challenges
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active, end_date);

-- =====================================================
-- USER CHALLENGE PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON user_challenge_progress(challenge_id);

-- =====================================================
-- BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Loyalty Points Policies
CREATE POLICY "Users can view their own loyalty points"
  ON loyalty_points FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own loyalty points"
  ON loyalty_points FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert their own loyalty points"
  ON loyalty_points FOR INSERT
  WITH CHECK (true);

-- Loyalty Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON loyalty_transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (true);

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (true);

-- Review Replies Policies
CREATE POLICY "Anyone can view review replies"
  ON review_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own replies"
  ON review_replies FOR INSERT
  WITH CHECK (true);

-- Referrals Policies
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

-- Challenges Policies
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (is_active = true);

-- User Challenge Progress Policies
CREATE POLICY "Users can view their own progress"
  ON user_challenge_progress FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own progress"
  ON user_challenge_progress FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert their own progress"
  ON user_challenge_progress FOR INSERT
  WITH CHECK (true);

-- Badges Policies
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- User Badges Policies
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER loyalty_points_updated_at
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_points();

-- Function to update user challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.progress >= (SELECT target FROM challenges WHERE id = NEW.challenge_id) THEN
    NEW.completed = TRUE;
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update challenge progress
CREATE TRIGGER user_challenge_progress_updated_at
  BEFORE UPDATE ON user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement) VALUES
  ('First Purchase', 'Made your first purchase on Banda', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop', 'Complete 1 purchase'),
  ('Review Master', 'Left 10 helpful reviews', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop', 'Submit 10 reviews'),
  ('Referral Champion', 'Invited 5 friends to Banda', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop', 'Refer 5 users'),
  ('Loyal Buyer', 'Made 20 purchases', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop', 'Complete 20 purchases'),
  ('Community Star', 'Earned 1000 loyalty points', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop', 'Reach 1000 points')
ON CONFLICT (name) DO NOTHING;

-- Insert seasonal challenges
INSERT INTO challenges (title, description, type, target, reward_points, end_date) VALUES
  ('Seasonal Harvest Shopper', 'Place 5 orders this month', 'purchase', 5, 200, NOW() + INTERVAL '30 days'),
  ('Bring a Friend', 'Invite 3 friends to Banda', 'referral', 3, 300, NOW() + INTERVAL '30 days'),
  ('Review Guru', 'Leave 5 reviews this month', 'review', 5, 150, NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Banda Loyalty & Gamification Schema created successfully!';
  RAISE NOTICE '📊 Tables created: loyalty_points, loyalty_transactions, reviews, review_replies, referrals, challenges, user_challenge_progress, badges, user_badges';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
  RAISE NOTICE '🎯 Default badges and challenges seeded';
END $$;
