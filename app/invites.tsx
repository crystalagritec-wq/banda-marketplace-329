import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  Linking,
  ScrollView,
} from 'react-native';
import {
  Users,
  MessageCircle,
  Phone,
  Mail,
  Copy,
  Gift,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';

import * as Clipboard from 'expo-clipboard';

interface InviteMethod {
  id: string;
  title: string;
  icon: any;
  color: string;
  action: () => void;
}

export default function InvitesScreen() {
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteStats] = useState({
    totalInvites: 12,
    successfulInvites: 8,
    pendingInvites: 4,
    rewardsEarned: 240,
  });

  const referralCode = 'BANDA2024';
  const inviteMessage = `Join me on Banda - the best marketplace for fresh farm produce! Use my referral code ${referralCode} and get exclusive rewards. Download now: https://banda.app/download`;

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
      console.log('Referral code copied to clipboard');
    } catch {
      console.log('Failed to copy referral code');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: inviteMessage,
        title: 'Join Banda - Fresh Farm Produce',
      });
    } catch {
      console.log('Failed to share invite');
    }
  };

  const handleInviteViaMessenger = async () => {
    try {
      const url = `fb-messenger://share?text=${encodeURIComponent(inviteMessage)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await handleShare();
      }
    } catch {
      await handleShare();
    }
    setShowInviteModal(false);
  };

  const handleInviteViaWhatsApp = async () => {
    try {
      const url = `whatsapp://send?text=${encodeURIComponent(inviteMessage)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await handleShare();
      }
    } catch {
      await handleShare();
    }
    setShowInviteModal(false);
  };

  const handleInviteViaEmail = async () => {
    try {
      const url = `mailto:?subject=Join Banda - Fresh Farm Produce&body=${encodeURIComponent(inviteMessage)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await handleShare();
      }
    } catch {
      await handleShare();
    }
    setShowInviteModal(false);
  };

  const inviteMethods: InviteMethod[] = [
    {
      id: 'messenger',
      title: 'Invite via Messenger',
      icon: MessageCircle,
      color: '#0084FF',
      action: handleInviteViaMessenger,
    },
    {
      id: 'whatsapp',
      title: 'Invite via WhatsApp',
      icon: Phone,
      color: '#25D366',
      action: handleInviteViaWhatsApp,
    },
    {
      id: 'email',
      title: 'Invite via Email',
      icon: Mail,
      color: '#EA4335',
      action: handleInviteViaEmail,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Invite Friends',
          headerStyle: { backgroundColor: '#2D5016' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Users size={48} color="white" />
            </View>
            <Text style={styles.headerTitle}>Invite Friends</Text>
            <Text style={styles.headerSubtitle}>
              Banda is best with friends. Invite them!
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inviteStats.totalInvites}</Text>
                <Text style={styles.statLabel}>Total Invites</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inviteStats.successfulInvites}</Text>
                <Text style={styles.statLabel}>Successful</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inviteStats.pendingInvites}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inviteStats.rewardsEarned}</Text>
                <Text style={styles.statLabel}>Points Earned</Text>
              </View>
            </View>
          </View>

          <View style={styles.referralSection}>
            <Text style={styles.sectionTitle}>Your Referral Code</Text>
            <View style={styles.referralCodeContainer}>
              <Text style={styles.referralCode}>{referralCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Copy size={20} color="#2D5016" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.inviteButtonGradient}>
              <Users size={24} color="white" />
              <Text style={styles.inviteButtonText}>Invite Friends</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Why Invite Friends?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Gift size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Earn 20 points for each successful invite</Text>
              </View>
              <View style={styles.benefitItem}>
                <Star size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Your friends get 10% off their first order</Text>
              </View>
              <View style={styles.benefitItem}>
                <Users size={20} color="#2D5016" />
                <Text style={styles.benefitText}>Build your farming community</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.modalIcon}>
                  <Users size={32} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.modalTitle}>Invite friends</Text>
              <Text style={styles.modalSubtitle}>Banda is best with friends. Invite them!</Text>
            </View>

            <View style={styles.inviteMethodsContainer}>
              {inviteMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.inviteMethodButton, { backgroundColor: method.color }]}
                    onPress={method.action}
                    activeOpacity={0.8}
                  >
                    <IconComponent size={24} color="white" />
                    <Text style={styles.inviteMethodText}>{method.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInviteModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  referralSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  referralCode: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  inviteButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  benefitsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  inviteMethodsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inviteMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  inviteMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});