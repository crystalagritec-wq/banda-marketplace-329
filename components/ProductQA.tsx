import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import {
  X,
  MessageCircle,
  ThumbsUp,
  Send,
  ChevronDown,
  ChevronUp,
  User,
  BadgeCheck,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';

interface Answer {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  helpful: number;
  isVendor: boolean;
  verified: boolean;
}

interface Question {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  answers: Answer[];
  helpful: number;
  expanded: boolean;
}

interface ProductQAProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Mary Wanjiku',
    text: 'Is this product organic and pesticide-free?',
    timestamp: new Date(Date.now() - 86400000 * 2),
    helpful: 12,
    expanded: false,
    answers: [
      {
        id: 'a1',
        userId: 'vendor1',
        userName: 'John Farmer',
        text: 'Yes, all our products are 100% organic and grown without any chemical pesticides. We use natural farming methods and can provide certification upon request.',
        timestamp: new Date(Date.now() - 86400000 * 2 + 3600000),
        helpful: 15,
        isVendor: true,
        verified: true,
      },
    ],
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Peter Mwangi',
    text: 'What is the minimum order quantity for bulk purchases?',
    timestamp: new Date(Date.now() - 86400000 * 5),
    helpful: 8,
    expanded: false,
    answers: [
      {
        id: 'a2',
        userId: 'vendor1',
        userName: 'John Farmer',
        text: 'For bulk orders, the minimum is 50kg. We offer discounts for orders above 100kg. Please contact us directly for custom pricing.',
        timestamp: new Date(Date.now() - 86400000 * 5 + 7200000),
        helpful: 10,
        isVendor: true,
        verified: true,
      },
      {
        id: 'a3',
        userId: 'user3',
        userName: 'Grace Mutua',
        text: 'I ordered 200kg last month and got a great discount. Highly recommend for restaurants!',
        timestamp: new Date(Date.now() - 86400000 * 4),
        helpful: 5,
        isVendor: false,
        verified: true,
      },
    ],
  },
  {
    id: '3',
    userId: 'user4',
    userName: 'James Omondi',
    text: 'How long does delivery take to Nairobi CBD?',
    timestamp: new Date(Date.now() - 86400000 * 7),
    helpful: 6,
    expanded: false,
    answers: [
      {
        id: 'a4',
        userId: 'vendor1',
        userName: 'John Farmer',
        text: 'Delivery to Nairobi CBD typically takes 2-4 hours for express delivery, or same-day for standard delivery if ordered before 2 PM.',
        timestamp: new Date(Date.now() - 86400000 * 7 + 1800000),
        helpful: 8,
        isVendor: true,
        verified: true,
      },
    ],
  },
];

export default function ProductQA({
  visible,
  onClose,
  productId,
  productName,
  vendorId,
  vendorName,
}: ProductQAProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [showAskQuestion, setShowAskQuestion] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) {
      Alert.alert('Empty Question', 'Please enter your question.');
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      userId: user?.id || 'current-user',
      userName: user?.name || 'You',
      text: newQuestion.trim(),
      timestamp: new Date(),
      answers: [],
      helpful: 0,
      expanded: false,
    };

    setQuestions((prev) => [question, ...prev]);
    setNewQuestion('');
    setShowAskQuestion(false);
    Alert.alert('Question Posted', 'Your question has been posted. The vendor will respond soon.');
  };

  const handleReply = (questionId: string) => {
    if (!replyText.trim()) {
      Alert.alert('Empty Reply', 'Please enter your reply.');
      return;
    }

    const answer: Answer = {
      id: Date.now().toString(),
      userId: user?.id || 'current-user',
      userName: user?.name || 'You',
      text: replyText.trim(),
      timestamp: new Date(),
      helpful: 0,
      isVendor: false,
      verified: false,
    };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q
      )
    );
    setReplyText('');
    setReplyingTo(null);
    Alert.alert('Reply Posted', 'Your reply has been posted.');
  };

  const toggleExpanded = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, expanded: !q.expanded } : q))
    );
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <User size={16} color="#6B7280" />
          </View>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.questionText}>{item.text}</Text>

      <View style={styles.questionActions}>
        <TouchableOpacity style={styles.actionButton}>
          <ThumbsUp size={16} color="#6B7280" />
          <Text style={styles.actionText}>Helpful ({item.helpful})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setReplyingTo(item.id)}
        >
          <MessageCircle size={16} color="#6B7280" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        {item.answers.length > 0 && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleExpanded(item.id)}
          >
            <Text style={styles.answerCount}>
              {item.answers.length} {item.answers.length === 1 ? 'Answer' : 'Answers'}
            </Text>
            {item.expanded ? (
              <ChevronUp size={16} color="#6B7280" />
            ) : (
              <ChevronDown size={16} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {item.expanded && item.answers.length > 0 && (
        <View style={styles.answersContainer}>
          {item.answers.map((answer) => (
            <View key={answer.id} style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <View style={styles.userInfo}>
                  <View
                    style={[
                      styles.userAvatar,
                      answer.isVendor && styles.vendorAvatar,
                    ]}
                  >
                    <User size={14} color={answer.isVendor ? '#2E7D32' : '#6B7280'} />
                  </View>
                  <View>
                    <View style={styles.answerNameRow}>
                      <Text
                        style={[
                          styles.answerUserName,
                          answer.isVendor && styles.vendorName,
                        ]}
                      >
                        {answer.userName}
                      </Text>
                      {answer.isVendor && (
                        <View style={styles.vendorBadge}>
                          <Text style={styles.vendorBadgeText}>Vendor</Text>
                        </View>
                      )}
                      {answer.verified && (
                        <BadgeCheck size={14} color="#10B981" />
                      )}
                    </View>
                    <Text style={styles.answerTimestamp}>
                      {answer.timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.answerText}>{answer.text}</Text>
              <TouchableOpacity style={styles.answerHelpful}>
                <ThumbsUp size={14} color="#6B7280" />
                <Text style={styles.answerHelpfulText}>
                  Helpful ({answer.helpful})
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {replyingTo === item.id && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
          />
          <View style={styles.replyActions}>
            <TouchableOpacity
              style={styles.cancelReplyButton}
              onPress={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
            >
              <Text style={styles.cancelReplyText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendReplyButton}
              onPress={() => handleReply(item.id)}
            >
              <Send size={16} color="#FFF" />
              <Text style={styles.sendReplyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Questions & Answers</Text>
            <Text style={styles.headerSubtitle}>{productName}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.askQuestionButton}
          onPress={() => setShowAskQuestion(!showAskQuestion)}
        >
          <MessageCircle size={20} color="#2E7D32" />
          <Text style={styles.askQuestionText}>Ask a Question</Text>
        </TouchableOpacity>

        {showAskQuestion && (
          <View style={styles.askQuestionContainer}>
            <TextInput
              style={styles.questionInput}
              placeholder="What would you like to know about this product?"
              value={newQuestion}
              onChangeText={setNewQuestion}
              multiline
              maxLength={300}
            />
            <Text style={styles.characterCount}>{newQuestion.length}/300</Text>
            <View style={styles.questionInputActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAskQuestion(false);
                  setNewQuestion('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postQuestionButton}
                onPress={handleAskQuestion}
              >
                <Send size={16} color="#FFF" />
                <Text style={styles.postQuestionText}>Post Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={questions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.questionsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MessageCircle size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No questions yet</Text>
              <Text style={styles.emptyText}>
                Be the first to ask a question about this product
              </Text>
            </View>
          }
        />
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  askQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  askQuestionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  askQuestionContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  questionInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  postQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  postQuestionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  questionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorAvatar: {
    backgroundColor: '#ECFDF5',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  questionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  questionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  answerCount: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  answersContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  answerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  answerHeader: {
    marginBottom: 8,
  },
  answerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  answerUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  vendorName: {
    color: '#2E7D32',
  },
  vendorBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vendorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  answerTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  answerText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  answerHelpful: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerHelpfulText: {
    fontSize: 12,
    color: '#6B7280',
  },
  replyInputContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFF',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelReplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  sendReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  sendReplyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
