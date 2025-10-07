import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import {
  Gift,
  Users,
  Star,
  Copy,
  MessageCircle,
  Phone,
  Mail,
  Coins,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

interface ReferralStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

export default function ReferralsScreen() {
  const [referralStats] = useState({
    totalReferrals: 15,
    activeReferrals: 12,
    totalEarnings: 450,
    pendingRewards: 80,
    currentLevel: 'Gold',
    nextLevelProgress: 75,
  });

  const referralCode = 'BANDA2024';
  const referralLink = `https://banda.app/ref/${referralCode}`;
  const shareMessage = `🌱 Join me on Banda - Farm to Family! 

Invite your friends to join Farm to Family and get rewarded! It's simple, fast, and a win-win for everyone.

Use my referral code: ${referralCode}
Or click: ${referralLink}

Get cashback on your first recharge of ₹100 and above by using my referral code!

Download now: https://banda.app/download`;

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
      console.log('Referral code copied to clipboard');
    } catch (error) {
      console.log('Failed to copy referral code');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareMessage,
        title: 'Join Banda - Farm to Family',
      });
    } catch (error) {
      console.log('Failed to share referral');
    }
  };

  const handleInviteViaWhatsApp = async () => {
    try {
      const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await handleShare();
      }
    } catch (error) {
      await handleShare();
    }
  };

  const handleInviteViaMessenger = async () => {
    try {
      const url = `fb-messenger://share?text=${encodeURIComponent(shareMessage)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await handleShare();
      }
    } catch (error) {
      await handleShare();
    }
  };

  const handleInviteViaEmail = async () => {
    try {
      const url = `mailto:?subject=Join Banda - Farm to Family&body=${encodeURIComponent(shareMessage)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await handleShare();
      }
    } catch (error) {
      await handleShare();
    }
  };

  const referralSteps: ReferralStep[] = [
    {
      id: 1,
      title: 'Refer Your Friends',
      description: 'Share your unique referral code or link with friends and family. The merrier!',
      icon: Users,
    },
    {
      id: 2,
      title: 'They Join',
      description: 'When your friend signs up and completes their registration, both of you win!',
      icon: Star,
    },
    {
      id: 3,
      title: 'Earn Rewards',
      description: 'Enjoy awesome rewards, including discounts, credits, or exclusive perks. The more friends you refer, the more you earn!',
      icon: Gift,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Refer & Earn',
          headerStyle: { backgroundColor: '#2D5016' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Share the Freshness.</Text>
            <Text style={styles.heroTitle}>Earn Rewards.</Text>
            <Text style={styles.heroSubtitle}>
              Invite your friends to join Farm to Family and get rewarded! It's simple, fast, and a win-win for everyone.
            </Text>
          </View>
          <View style={styles.heroIllustration}>
            <View style={styles.illustrationContainer}>
              <Gift size={60} color="white" />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Referral Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={24} color="#2D5016" />
                <Text style={styles.statNumber}>{referralStats.totalReferrals}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={24} color="#2D5016" />
                <Text style={styles.statNumber}>{referralStats.activeReferrals}</Text>
                <Text style={styles.statLabel}>Active Referrals</Text>
              </View>
              <View style={styles.statCard}>
                <Coins size={24} color="#2D5016" />
                <Text style={styles.statNumber}>₹{referralStats.totalEarnings}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <Award size={24} color="#2D5016" />
                <Text style={styles.statNumber}>{referralStats.currentLevel}</Text>
                <Text style={styles.statLabel}>Current Level</Text>
              </View>
            </View>
          </View>

          <View style={styles.referralSection}>
            <Text style={styles.sectionTitle}>Refer & Earn</Text>
            <Text style={styles.sectionSubtitle}>Share the Love, Get Rewards!</Text>
            
            <View style={styles.referralCodeSection}>
              <Text style={styles.referralLabel}>Your Referral Code</Text>
              <View style={styles.referralCodeContainer}>
                <Text style={styles.referralCode}>{referralCode}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                  <Copy size={20} color="#2D5016" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.shareButtonsContainer}>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: '#25D366' }]} onPress={handleInviteViaWhatsApp}>
                <Phone size={20} color="white" />
                <Text style={styles.shareButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: '#0084FF' }]} onPress={handleInviteViaMessenger}>
                <MessageCircle size={20} color="white" />
                <Text style={styles.shareButtonText}>Messenger</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: '#EA4335' }]} onPress={handleInviteViaEmail}>
                <Mail size={20} color="white" />
                <Text style={styles.shareButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.howItWorksSection}>
            <Text style={styles.sectionTitle}>How it Works:</Text>
            <View style={styles.stepsContainer}>
              {referralSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <View key={step.id} style={styles.stepItem}>
                    <View style={styles.stepIconContainer}>
                      <View style={styles.stepIcon}>
                        <IconComponent size={24} color="#2D5016" />
                      </View>
                      <Text style={styles.stepNumber}>{step.id}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Reward Benefits</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Gift size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Get cashback on your first recharge of ₹100 and above</Text>
              </View>
              <View style={styles.benefitItem}>
                <Star size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Earn ₹30 for every successful referral</Text>
              </View>
              <View style={styles.benefitItem}>
                <Coins size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Your friends get ₹20 welcome bonus</Text>
              </View>
              <View style={styles.benefitItem}>
                <Award size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Unlock exclusive perks as you level up</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.referNowButton} onPress={handleShare}>
            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.referNowGradient}>
              <Gift size={24} color="white" />
              <Text style={styles.referNowText}>Refer Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
    paddingRight: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    lineHeight: 22,
  },
  heroIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  referralSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  referralCodeSection: {
    marginBottom: 24,
  },
  referralLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  howItWorksSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepsContainer: {
    gap: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  rewardsSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  referNowButton: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  referNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  referNowText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
});