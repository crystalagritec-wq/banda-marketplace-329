import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import {
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'offer';
  imageUrl?: string;
  offerAmount?: number;
}

interface ProductChatProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  vendorVerified?: boolean;
  negotiable?: boolean;
  disableCall?: boolean;
  disableAttachments?: boolean;
  disableContactShare?: boolean;
  disableSocialLinks?: boolean;
}

export default function ProductChat({
  visible,
  onClose,
  productId,
  productName,
  productImage,
  productPrice,
  vendorId,
  vendorName,
  vendorAvatar,
  vendorVerified = false,
  negotiable = false,
  disableCall = true,
  disableAttachments = true,
  disableContactShare = true,
  disableSocialLinks = true,
}: ProductChatProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: vendorId,
      senderName: vendorName,
      text: `Hello! Thank you for your interest in ${productName}. How can I help you?`,
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      type: 'text',
    },
  ]);
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [showOfferInput, setShowOfferInput] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      text: message.trim(),
      timestamp: new Date(),
      read: false,
      type: 'text',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    setTimeout(() => {
      const vendorReply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: vendorId,
        senderName: vendorName,
        text: 'Thank you for your message. I will get back to you shortly.',
        timestamp: new Date(),
        read: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, vendorReply]);
    }, 2000);
  };

  const handleSendOffer = () => {
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid offer amount.');
      return;
    }

    if (amount >= productPrice) {
      Alert.alert(
        'Offer Too High',
        'Your offer should be lower than the current price for negotiation.'
      );
      return;
    }

    const offerMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      text: `I would like to offer KES ${amount.toLocaleString('en-KE')} for this product.`,
      timestamp: new Date(),
      read: false,
      type: 'offer',
      offerAmount: amount,
    };

    setMessages((prev) => [...prev, offerMessage]);
    setOfferAmount('');
    setShowOfferInput(false);

    setTimeout(() => {
      const vendorReply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: vendorId,
        senderName: vendorName,
        text: 'Thank you for your offer. Let me review it and get back to you.',
        timestamp: new Date(),
        read: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, vendorReply]);
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === (user?.id || 'current-user');

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageContainerRight : styles.messageContainerLeft,
        ]}
      >
        {!isCurrentUser && (
          <Image
            source={{
              uri:
                vendorAvatar ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
            item.type === 'offer' && styles.offerBubble,
          ]}
        >
          {item.type === 'offer' && (
            <View style={styles.offerHeader}>
              <Text style={styles.offerLabel}>Price Offer</Text>
              <Text style={styles.offerAmount}>
                KES {item.offerAmount?.toLocaleString('en-KE')}
              </Text>
            </View>
          )}
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isCurrentUser ? styles.messageTimeRight : styles.messageTimeLeft,
              ]}
            >
              {item.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isCurrentUser && (
              <View style={styles.readStatus}>
                {item.read ? (
                  <CheckCheck size={14} color="#10B981" />
                ) : (
                  <Check size={14} color="#9CA3AF" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.vendorInfo}>
              <Image
                source={{
                  uri:
                    vendorAvatar ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                }}
                style={styles.vendorAvatar}
              />
              <View>
                <View style={styles.vendorNameRow}>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                  {vendorVerified && <Text style={styles.verifiedBadge}>✓</Text>}
                </View>
                <Text style={styles.onlineStatus}>Online</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerActionButton, disableCall && styles.disabledBtn]}
              onPress={() => {
                if (disableCall) {
                  Alert.alert('Call Disabled', 'Calling is disabled in this chat.');
                }
              }}
              disabled={disableCall}
            >
              <Phone size={20} color={disableCall ? '#9CA3AF' : '#2E7D32'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerActionButton, (disableContactShare || disableSocialLinks) && styles.disabledBtn]}
              onPress={() => {
                if (disableContactShare || disableSocialLinks) {
                  Alert.alert('Actions Disabled', 'Contact sharing and social links are disabled.');
                }
              }}
              disabled={disableContactShare || disableSocialLinks}
            >
              <MoreVertical size={20} color={(disableContactShare || disableSocialLinks) ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Image source={{ uri: productImage }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>
              {productName}
            </Text>
            <Text style={styles.productPrice}>
              KES {productPrice.toLocaleString('en-KE')}
            </Text>
          </View>
          {negotiable && (
            <TouchableOpacity
              style={styles.makeOfferButton}
              onPress={() => setShowOfferInput(!showOfferInput)}
            >
              <Text style={styles.makeOfferText}>Make Offer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Offer Input */}
        {showOfferInput && (
          <View style={styles.offerInputContainer}>
            <TextInput
              style={styles.offerInput}
              placeholder="Enter your offer amount"
              keyboardType="numeric"
              value={offerAmount}
              onChangeText={setOfferAmount}
            />
            <TouchableOpacity style={styles.sendOfferButton} onPress={handleSendOffer}>
              <Text style={styles.sendOfferText}>Send Offer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[styles.attachButton, disableAttachments && styles.disabledBtn]}
            onPress={() => {
              if (disableAttachments) {
                Alert.alert('Attachments Disabled', 'Image and file attachments are disabled.');
              }
            }}
            disabled={disableAttachments}
          >
            <Paperclip size={22} color={disableAttachments ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#10B981',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  makeOfferButton: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  makeOfferText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  offerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    gap: 12,
  },
  offerInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  sendOfferButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendOfferText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageContainerLeft: {
    alignSelf: 'flex-start',
  },
  messageContainerRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  messageBubbleLeft: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#2E7D32',
    borderBottomRightRadius: 4,
  },
  offerBubble: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  offerHeader: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  offerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#1F2937',
  },
  messageTextRight: {
    color: '#FFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeLeft: {
    color: '#9CA3AF',
  },
  messageTimeRight: {
    color: 'rgba(255,255,255,0.7)',
  },
  readStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#2E7D32',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
