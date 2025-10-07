import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, 
  Mic, 
  Camera, 
  Paperclip,
  Bot,
  User,
  Leaf,
  Plus,
  Smile,
  MoreHorizontal,
  Phone,
  Video
} from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'suggestion';
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Habari! I am Mkulima AI, your agricultural assistant. How can I help you today?',
    sender: 'ai',
    timestamp: new Date(),
  },
  {
    id: '2',
    text: 'Here are some things I can help you with:',
    sender: 'ai',
    timestamp: new Date(),
    type: 'suggestion'
  }
];

const suggestions = [
  'What crops grow best in my area?',
  'How do I treat tomato blight?',
  'Current market prices for maize',
  'Best time to plant beans',
  'Organic pest control methods',
  'Soil testing recommendations'
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const sendMessage = async (text: string) => {
    if (!text?.trim() || text.trim().length === 0 || text.length > 500) return;
    const sanitizedText = text.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: sanitizedText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(sanitizedText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const generateAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('maize') || lowerText.includes('corn')) {
      return 'Maize is currently trading at KSh 45-50 per kg in Nairobi markets. For best yields, plant during the long rains (March-May) and ensure proper spacing of 75cm between rows. Consider using certified seeds and apply DAP fertilizer at planting.';
    }
    
    if (lowerText.includes('tomato') || lowerText.includes('blight')) {
      return 'Tomato blight is common during wet seasons. Prevention: Use resistant varieties, ensure good air circulation, avoid overhead watering. Treatment: Apply copper-based fungicides like Copper Oxychloride. Remove affected leaves immediately.';
    }
    
    if (lowerText.includes('price') || lowerText.includes('market')) {
      return 'Current market prices in Nairobi: Tomatoes KSh 80/kg, Onions KSh 60/kg, Cabbages KSh 40/kg, Irish Potatoes KSh 55/kg. Prices vary by season and quality. Would you like specific crop price alerts?';
    }
    
    if (lowerText.includes('pest') || lowerText.includes('organic')) {
      return 'Organic pest control methods: 1) Neem oil spray for aphids, 2) Companion planting (marigolds with tomatoes), 3) Diatomaceous earth for crawling insects, 4) Soap spray for soft-bodied pests. Always apply in the evening to avoid leaf burn.';
    }
    
    if (lowerText.includes('soil') || lowerText.includes('test')) {
      return 'Soil testing is crucial for optimal yields. Test for pH (ideal 6.0-7.0 for most crops), nitrogen, phosphorus, potassium, and organic matter. Contact your local agricultural extension office or use our partner labs. Cost: KSh 1,500-3,000 per test.';
    }
    
    if (lowerText.includes('bean') || lowerText.includes('plant')) {
      return 'Best time to plant beans: Short rains (October-December) and long rains (March-May). Choose varieties suited to your altitude. Plant 5cm deep, 10cm apart in rows 40cm apart. Beans fix nitrogen, so they\'re great for crop rotation.';
    }
    
    return 'Thank you for your question! As your AI agricultural assistant, I can help with crop advice, market prices, pest control, soil management, and farming best practices. Could you be more specific about what you\'d like to know?';
  };

  const MessageBubble = ({ message, index }: { message: Message; index: number }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, [animatedValue, index]);

    return (
      <Animated.View 
        style={[
          styles.messageBubble,
          message.sender === 'user' ? styles.userMessage : styles.aiMessage,
          {
            opacity: animatedValue,
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }]
          }
        ]}
      >
        {message.sender === 'ai' && (
          <View style={styles.aiAvatar}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.avatarGradient}
            >
              <Bot size={18} color="white" />
            </LinearGradient>
          </View>
        )}
        
        <View style={[
          styles.messageContent,
          message.sender === 'user' ? styles.userMessageContent : styles.aiMessageContent
        ]}>
          {message.type === 'suggestion' && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionTitle}>Quick suggestions:</Text>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionButton}
                  onPress={() => {
                    if (suggestion?.trim() && suggestion.length <= 100) {
                      sendMessage(suggestion.trim());
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {message.type !== 'suggestion' && (
            <>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.sender === 'user' ? styles.userMessageTime : styles.aiMessageTime
              ]}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </>
          )}
        </View>
        
        {message.sender === 'user' && (
          <View style={styles.userAvatar}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.avatarGradient}
            >
              <User size={18} color="white" />
            </LinearGradient>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      
      {/* Modern Header */}
      <LinearGradient colors={['#2E7D32', '#1B5E20']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.aiHeaderAvatar}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.headerAvatarGradient}
              >
                <Leaf size={28} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Mkulima AI</Text>
              <Text style={styles.headerSubtitle}>Online • Agricultural Assistant</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Phone size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Video size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <MoreHorizontal size={22} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Chat Background */}
      <LinearGradient colors={['#F8F9FA', '#FFFFFF']} style={styles.chatBackground}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
            
            {isTyping && (
              <Animated.View style={[styles.messageBubble, styles.aiMessage]}>
                <View style={styles.aiAvatar}>
                  <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    style={styles.avatarGradient}
                  >
                    <Bot size={18} color="white" />
                  </LinearGradient>
                </View>
                <View style={[styles.messageContent, styles.aiMessageContent]}>
                  <View style={styles.typingIndicator}>
                    <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
                    <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
                    <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Modern Input */}
          <View style={styles.inputContainer}>
            {showAttachments && (
              <View style={styles.attachmentsRow}>
                <TouchableOpacity style={styles.attachmentOption}>
                  <Camera size={24} color="#4CAF50" />
                  <Text style={styles.attachmentText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentOption}>
                  <Paperclip size={24} color="#2196F3" />
                  <Text style={styles.attachmentText}>File</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentOption}>
                  <Mic size={24} color="#FF9800" />
                  <Text style={styles.attachmentText}>Voice</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.plusButton}
                onPress={() => setShowAttachments(!showAttachments)}
              >
                <Plus size={24} color="#666" />
              </TouchableOpacity>
              
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your message..."
                  placeholderTextColor="#999"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity style={styles.emojiButton}>
                  <Smile size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={inputText.trim() ? ['#4CAF50', '#2E7D32'] : ['#E0E0E0', '#BDBDBD']}
                  style={styles.sendGradient}
                >
                  <Send size={20} color={inputText.trim() ? "white" : "#999"} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiHeaderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerAvatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatBackground: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 2,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 20,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userMessageContent: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 6,
  },
  aiMessageContent: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8F5E8',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#1A1A1A',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: '#999',
  },
  suggestionsContainer: {
    gap: 10,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  suggestionButton: {
    backgroundColor: '#F1F8E9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  attachmentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  attachmentOption: {
    alignItems: 'center',
    padding: 12,
  },
  attachmentText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  plusButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    color: '#1A1A1A',
  },
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  sendGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});