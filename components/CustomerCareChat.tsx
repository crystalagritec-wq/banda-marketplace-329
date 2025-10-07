import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, User } from 'lucide-react-native';
import { useCustomerCare } from '@/hooks/useCustomerCare';
import { validateAiResponse, type ValidatedAiResponse } from '@/utils/validateAiResponse';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  actions?: ValidatedAiResponse['actions'];
}

const SYSTEM_PROMPT = `You are BANDA Customer Care AI Assistant. 
Your job:
- Answer in friendly, supportive text.
- Suggest ACTIONS when relevant in this JSON format:

{
  "label": "short button text",
  "type": "navigation | modal | link | deeplink",
  "screen": "ScreenID (if navigation or deeplink)",
  "url": "https://... (if link)",
  "params": { "key": "value" } (optional, for deeplink)
}

Rules:
- Use only these screens: MarketplaceScreen, CartScreen, OrdersScreen, PaymentsScreen, UpgradeScreen, ProfileScreen, FarmsScreen, LogisticsScreen, DisputeScreen, SupportScreen, BenefitsScreen, ServicesScreen, CommunityScreen, NotificationsScreen, LocationScreen.
- Provide max 3 actions per answer.
- If type = link, must include valid https:// URL.
- If type = deeplink, must include screen + params.
- If no action needed, return only text.`;

export default function CustomerCareChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi! I\'m your BANDA Customer Care assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      actions: [
        { label: 'Browse Marketplace', type: 'navigation', screen: 'MarketplaceScreen' },
        { label: 'Check Orders', type: 'navigation', screen: 'OrdersScreen' },
        { label: 'Contact Support', type: 'link', url: 'https://banda.ai/support' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { handleAction } = useCustomerCare();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage.text },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      let aiResponseText = data.completion || 'I apologize, but I\'m having trouble responding right now.';
      
      // Try to parse JSON response for actions
      let parsedResponse: any = { text: aiResponseText, actions: [] };
      try {
        // Check if response contains JSON
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonPart = jsonMatch[0];
          const textPart = aiResponseText.replace(jsonPart, '').trim();
          const parsed = JSON.parse(jsonPart);
          parsedResponse = {
            text: textPart || parsed.text || aiResponseText,
            actions: parsed.actions || [],
          };
        }
      } catch (e) {
        // If JSON parsing fails, use the text as-is
        console.log('No JSON actions found, using text response');
      }

      const validatedResponse = validateAiResponse(parsedResponse);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: validatedResponse.text,
        isUser: false,
        timestamp: new Date(),
        actions: validatedResponse.actions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m sorry, I\'m having trouble connecting right now. Please try again or contact our support team directly.',
        isUser: false,
        timestamp: new Date(),
        actions: [
          { label: 'Contact Support', type: 'link', url: 'https://banda.ai/support' },
          { label: 'Call Us', type: 'link', url: 'tel:+254705256259' },
        ],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  const renderMessage = useCallback((message: ChatMessage) => {
    return (
      <View key={message.id} style={[styles.messageContainer, message.isUser ? styles.userMessage : styles.aiMessage]}>
        <View style={styles.messageHeader}>
          <View style={[styles.avatar, message.isUser ? styles.userAvatar : styles.aiAvatar]}>
            {message.isUser ? (
              <User size={16} color="#fff" />
            ) : (
              <Bot size={16} color="#fff" />
            )}
          </View>
          <Text style={styles.messageTime}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
            {message.text}
          </Text>
        </View>
        
        {message.actions && message.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleAction(action)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }, [handleAction]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.messageHeader}>
              <View style={[styles.avatar, styles.aiAvatar]}>
                <Bot size={16} color="#fff" />
              </View>
              <Text style={styles.messageTime}>Now</Text>
            </View>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color="#16A34A" />
              <Text style={[styles.messageText, styles.aiText, { marginLeft: 8 }]}>Typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about BANDA..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.8}
        >
          <Send size={20} color={(!inputText.trim() || isLoading) ? '#9CA3AF' : '#fff'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: '#3B82F6',
  },
  aiAvatar: {
    backgroundColor: '#16A34A',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#111827',
  },
  actionsContainer: {
    marginTop: 8,
    gap: 6,
  },
  actionButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
});