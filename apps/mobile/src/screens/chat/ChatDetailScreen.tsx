/** @jsxImportSource nativewind */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, NativeScrollEvent, NativeSyntheticEvent, Animated, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MoreVertical, Paperclip, Send, ChevronDown, CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react-native';
import {
  Screen,
  Text,
  Avatar,
  ChatBubble,
  Input,
  JobPreviewCard,
} from '@conecteja/ui-mobile';
import { useChats } from '../../contexts/ChatsContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatDetailScreenProps } from '../../types/navigation';

export default function ChatDetailScreen({ navigation, route }: ChatDetailScreenProps) {
  const { t } = useTranslation();
  const {
    conversationId,
    clientId,
    professionalId,
    professionalName,
    professionalAvatar
  } = route?.params || {};

  const { user } = useAuth();
  const {
    currentConversation,
    messages,
    loading,
    fetchConversationById,
    fetchMessages,
    sendMessage,
    setPendingConversation,
    markConversationMessagesAsRead,
    closeContract,
    endConversation,
    blockProfessional,
    reportProfessional,
  } = useChats();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [isContractClosed, setIsContractClosed] = useState(false);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [isProfessionalBlocked, setIsProfessionalBlocked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewReady, setScrollViewReady] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCountWhileScrolled, setUnreadCountWhileScrolled] = useState(0);
  const scrollButtonOpacity = useRef(new Animated.Value(0)).current;
  const [firstUnreadIndex, setFirstUnreadIndex] = useState<number | null>(null);
  const messagePositions = useRef<{ [key: number]: number }>({});
  const [layoutReady, setLayoutReady] = useState(false);
  const hasScrolledInitiallyRef = useRef(false);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check if this is a pending conversation (no conversationId yet)
  const isPendingConversation = !conversationId && clientId && professionalId;

  // Handle when ScrollView layout is ready
  const handleScrollViewLayout = () => {
    if (!scrollViewReady) {
      setScrollViewReady(true);
    }
  };

  // Check if user is at the bottom of the scroll (with more generous threshold)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const isBottom = distanceFromBottom < 100; // WhatsApp-style threshold

    setIsAtBottom(isBottom);
    setIsInitialLoad(false);

    // Calculate visible area
    const scrollY = contentOffset.y;
    const viewportHeight = layoutMeasurement.height;
    const visibleTop = scrollY;
    const visibleBottom = scrollY + viewportHeight;

    // Mark messages as read if they are visible in the viewport (with throttling)
    if (conversationId && user?.id) {
      const unreadMessages = messages.filter(
        (msg, index) =>
          !msg.is_read &&
          msg.sender_profile_id !== user.id &&
          messagePositions.current[index] !== undefined &&
          messagePositions.current[index] >= visibleTop &&
          messagePositions.current[index] <= visibleBottom
      );

      if (unreadMessages.length > 0) {
        // Clear existing timeout
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }

        // Mark messages as read after user stops scrolling for 500ms
        markAsReadTimeoutRef.current = setTimeout(() => {
          markMessagesAsRead();
        }, 500);
      }
    }

    // Show/hide scroll to bottom button
    if (isBottom) {
      if (showScrollButton) {
        // Fade out
        Animated.timing(scrollButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowScrollButton(false));
      }
      setUnreadCountWhileScrolled(0);
    } else if (!showScrollButton && !isInitialLoad) {
      // Fade in
      setShowScrollButton(true);
      Animated.timing(scrollButtonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Helper function to mark messages as read
  const markMessagesAsRead = useCallback(() => {
    if (conversationId) {
      markConversationMessagesAsRead(conversationId);
    }
  }, [conversationId, markConversationMessagesAsRead]);

  // Helper function to attempt scroll with retries
  const attemptScrollWithRetries = useCallback((
    scrollAction: () => void,
    context: string,
    attempts = 0,
    maxAttempts = 20
  ) => {
    // Don't attempt scroll if component is unmounted
    if (!isMountedRef.current) {
      return;
    }

    if (scrollViewRef.current) {
      try {
        scrollAction();
      } catch {
        // Silently handle scroll errors during navigation
        if (attempts < maxAttempts && isMountedRef.current) {
          setTimeout(() =>
            attemptScrollWithRetries(scrollAction, context, attempts + 1, maxAttempts),
            50
          );
        }
      }
    } else if (attempts < maxAttempts && isMountedRef.current) {
      setTimeout(() =>
        attemptScrollWithRetries(scrollAction, context, attempts + 1, maxAttempts),
        50
      );
    }
    // Removed error logging - fails silently if component unmounts
  }, []);

  // Function to scroll to bottom
  const scrollToBottom = useCallback((animated = true) => {
    attemptScrollWithRetries(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
      setUnreadCountWhileScrolled(0);
      // Mark messages as read when scrolling to bottom
      if (conversationId && messages.some(msg => !msg.is_read && msg.sender_profile_id !== user?.id)) {
        markMessagesAsRead();
      }
    }, 'scrollToBottom');
  }, [conversationId, messages, user?.id, markMessagesAsRead, attemptScrollWithRetries]);

  useEffect(() => {
    isMountedRef.current = true;

    // Cleanup timeout on unmount
    return () => {
      isMountedRef.current = false;
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsInitialLoad(true);
    setFirstUnreadIndex(null);
    setLayoutReady(false);
    hasScrolledInitiallyRef.current = false;
    messagePositions.current = {};
    setScrollViewReady(false);

    if (conversationId) {
      // Existing conversation - fetch it
      fetchConversationById(conversationId);
      fetchMessages(conversationId);
    } else if (isPendingConversation) {
      // Pending conversation - set it up for display
      setPendingConversation(clientId!, professionalId!, 'pending', professionalName, professionalAvatar);
      hasScrolledInitiallyRef.current = true; // No need to scroll for empty conversation
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isPendingConversation, clientId, professionalId, professionalName, professionalAvatar]);

  // Find first unread message when messages load
  useEffect(() => {
    if (messages.length > 0 && user?.id && !loading) {
      const firstUnread = messages.findIndex(
        msg => !msg.is_read && msg.sender_profile_id !== user.id
      );
      setFirstUnreadIndex(firstUnread >= 0 ? firstUnread : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, user?.id, loading]);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length);

  // Perform initial scroll when messages are loaded
  useEffect(() => {
    if (!loading && messages.length > 0 && layoutReady && scrollViewReady && !hasScrolledInitiallyRef.current) {
      hasScrolledInitiallyRef.current = true;

      // Add a small delay to ensure content is fully rendered
      const scrollTimeout = setTimeout(() => {
        attemptScrollWithRetries(() => {
          if (firstUnreadIndex !== null && firstUnreadIndex > 0) {
            const unreadPosition = messagePositions.current[firstUnreadIndex];
            if (unreadPosition !== undefined) {
              const scrollY = Math.max(0, unreadPosition - 100);
              scrollViewRef.current?.scrollTo({ x: 0, y: scrollY, animated: false });
            } else {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }
          } else {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }
          setIsInitialLoad(false);
        }, 'initialScroll');
      }, 100);

      return () => clearTimeout(scrollTimeout);
    }
  }, [loading, layoutReady, scrollViewReady, messages.length, firstUnreadIndex, attemptScrollWithRetries]);

  // Auto-scroll for new messages (after initial load)
  useEffect(() => {
    if (!isInitialLoad && messages.length > prevMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.sender_profile_id === user?.id;

      if (isOwnMessage || isAtBottom) {
        // Always scroll for own messages or if already at bottom
        // Small delay to allow message to render
        setTimeout(() => {
          attemptScrollWithRetries(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
            setUnreadCountWhileScrolled(0);
          }, 'autoScroll');
        }, 100);
      } else {
        // User is scrolled up, increment unread counter
        setUnreadCountWhileScrolled(prev => prev + 1);
      }
    }

    prevMessageCountRef.current = messages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isAtBottom, user?.id, isInitialLoad, attemptScrollWithRetries]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);

      if (isPendingConversation) {
        // Create conversation with first message
        const newConversationId = await sendMessage(
          null,
          messageText.trim(),
          'text',
          { clientId: clientId!, professionalId: professionalId!, jobId: 'pending' }
        );

        // Update route params with the new conversationId to avoid recreating
        if (newConversationId) {
          navigation.setParams({
            conversationId: newConversationId,
            clientId: undefined,
            professionalId: undefined,
            professionalName: undefined,
            professionalAvatar: undefined,
          });

          // Fetch the conversation and messages to ensure they're loaded
          await fetchConversationById(newConversationId);
          await fetchMessages(newConversationId);
        }
      } else if (conversationId) {
        // Existing conversation
        await sendMessage(conversationId, messageText.trim());
      }

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      // You could show an error toast here
    } finally {
      setSending(false);
    }
  };

  // Helper function to show confirmation modal (works on web and mobile)
  const showConfirmation = (title: string, message: string, confirmText: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmAction({
      title,
      message,
      confirmText,
      onConfirm,
      isDestructive,
    });
    setShowConfirmModal(true);
  };

  // Quick actions for client
  const handleCloseContract = () => {
    if (!currentConversation?.job_posting?.id || !currentConversation?.professional_profile?.id) {
      console.error('Missing job posting or professional profile');
      return;
    }

    showConfirmation(
      t('chats.actions.closeContractDetails.title'),
      t('chats.actions.closeContractDetails.message'),
      t('chats.actions.closeContractDetails.confirm'),
      async () => {
        setShowConfirmModal(false);
        const success = await closeContract(
          currentConversation.job_posting!.id,
          currentConversation.professional_profile.id,
          currentConversation.id
        );

        if (success) {
          setIsContractClosed(true);
          // Show success message
          showConfirmation(
            t('chats.actions.closeContractDetails.success.title'),
            t('chats.actions.closeContractDetails.success.message'),
            t('common.ok'),
            () => setShowConfirmModal(false)
          );
        }
      }
    );
  };

  const handleEndConversation = () => {
    if (!currentConversation?.id) {
      console.error('Missing conversation ID');
      return;
    }

    showConfirmation(
      t('chats.actions.endConversationDetails.title'),
      t('chats.actions.endConversationDetails.message'),
      t('chats.actions.endConversationDetails.confirm'),
      async () => {
        setShowConfirmModal(false);
        const success = await endConversation(currentConversation.id);

        if (success) {
          setIsConversationEnded(true);
          // Show success message
          showConfirmation(
            t('chats.actions.endConversationDetails.success.title'),
            t('chats.actions.endConversationDetails.success.message'),
            t('common.ok'),
            () => setShowConfirmModal(false)
          );
        }
      },
      true // isDestructive
    );
  };

  const handleBlockProfessional = () => {
    if (!currentConversation?.professional_profile?.id) {
      console.error('Missing professional profile');
      return;
    }

    showConfirmation(
      t('chats.actions.blockProfessionalDetails.title'),
      t('chats.actions.blockProfessionalDetails.message'),
      t('chats.actions.blockProfessionalDetails.confirm'),
      async () => {
        setShowConfirmModal(false);
        const success = await blockProfessional(
          currentConversation.professional_profile.id,
          'Blocked from chat'
        );

        if (success) {
          setIsProfessionalBlocked(true);
          // Show success message
          showConfirmation(
            t('chats.actions.blockProfessionalDetails.success.title'),
            t('chats.actions.blockProfessionalDetails.success.message'),
            t('common.ok'),
            () => setShowConfirmModal(false)
          );
        }
      },
      true // isDestructive
    );
  };

  const handleReportProfessional = () => {
    if (!currentConversation?.professional_profile?.id) {
      console.error('Missing professional profile');
      return;
    }

    showConfirmation(
      t('chats.actions.reportProfessionalDetails.title'),
      t('chats.actions.reportProfessionalDetails.message'),
      t('chats.actions.reportProfessionalDetails.confirm'),
      async () => {
        setShowConfirmModal(false);
        const success = await reportProfessional(
          currentConversation.professional_profile.id,
          'Inappropriate behavior',
          'Reported from chat conversation'
        );

        if (success) {
          // Show success message
          showConfirmation(
            t('chats.actions.reportProfessionalDetails.success.title'),
            t('chats.actions.reportProfessionalDetails.success.message'),
            t('common.ok'),
            () => setShowConfirmModal(false)
          );
        }
      },
      true // isDestructive
    );
  };

  if (loading && !currentConversation) {
    return (
      <Screen className="bg-gray-50" contentContainerClassName="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </Screen>
    );
  }

  if (!currentConversation && !isPendingConversation) {
    return (
      <Screen className="bg-gray-50" contentContainerClassName="flex-1 items-center justify-center">
        <Text variant="body" color="muted">
          {t('chats.empty.title')}
        </Text>
      </Screen>
    );
  }

  // Determine the other user in the conversation
  const otherProfile = user?.id === currentConversation?.client_profile_id
    ? currentConversation?.professional_profile
    : currentConversation?.client_profile;

  const isOnline = otherProfile?.last_seen_at
    ? new Date().getTime() - new Date(otherProfile.last_seen_at).getTime() < 5 * 60 * 1000 // 5 minutes
    : false;

  // Check if current user is the client
  const isClient = user?.id === currentConversation?.client_profile_id;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200">
        {/* Header with user info */}
        <View className="px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <ChevronLeft size={28} color="#374151" />
            </TouchableOpacity>
            <Avatar name={otherProfile?.full_name || ''} size="sm" uri={otherProfile?.avatar_url} />
            <View className="flex-1 ml-3">
              <Text variant="body" weight="bold">
                {otherProfile?.full_name || t('professional.defaults.name')}
              </Text>
              <Text variant="caption" color="muted">
                {isOnline ? t('chats.detail.online') : ''}
              </Text>
            </View>
            <TouchableOpacity>
              <MoreVertical size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Job Preview Card */}
        {currentConversation?.job_posting && (
          <View className="px-4 pb-3">
            <JobPreviewCard
              jobId={currentConversation.job_posting.id}
              title={currentConversation.job_posting.title}
              description={currentConversation.job_posting.description}
              budgetMin={currentConversation.job_posting.budget_min!}
              budgetMax={currentConversation.job_posting.budget_max!}
              budgetType={currentConversation.job_posting.budget_type}
              location={currentConversation.job_posting.location_address!}
              status={currentConversation.job_posting.status}
              compact={true}
              onPress={() => {
                if (currentConversation.job_posting?.id) {
                  navigation.navigate('JobDetail', {
                    jobId: currentConversation.job_posting.id
                  });
                }
              }}
            />
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="flex-1 relative">
          <ScrollView
            ref={scrollViewRef}
            onLayout={handleScrollViewLayout}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {isPendingConversation && messages.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Text variant="body" color="muted" align="center" className="mb-2">
                  {t('chats.detail.startConversation')}
                </Text>
                <Text variant="caption" color="muted" align="center">
                  {t('chats.detail.firstMessageHint')}
                </Text>
              </View>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.sender_profile_id === user?.id;
                const timestamp = message.created_at
                  ? new Date(message.created_at).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : '';

                return (
                  <View
                    key={message.id}
                    onLayout={(event) => {
                      // Save the Y position of this message
                      const { y } = event.nativeEvent.layout;
                      messagePositions.current[index] = y;

                      // Trigger layout ready when last message is rendered
                      if (index === messages.length - 1 && !layoutReady) {
                        setLayoutReady(true);
                      }
                    }}
                  >
                    <ChatBubble
                      message={message.content || ''}
                      isOwn={isOwn}
                      timestamp={timestamp}
                      isRead={message.is_read || false}
                      imageUri={message.attachment_url || undefined}
                    />
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Scroll to bottom button (WhatsApp style) */}
          {showScrollButton && (
            <Animated.View
              style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                opacity: scrollButtonOpacity,
              }}
            >
              <TouchableOpacity
                onPress={() => scrollToBottom(true)}
                className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg"
                style={{
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                <ChevronDown size={24} color="#3B82F6" />
                {unreadCountWhileScrolled > 0 && (
                  <View
                    className="absolute -top-1 -right-1 bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1"
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                      }}
                    >
                      {unreadCountWhileScrolled > 99 ? '99+' : unreadCountWhileScrolled}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Quick Actions for Client */}
        {isClient && !isConversationEnded && !isProfessionalBlocked && (
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row justify-between items-center mb-3">
              <Text variant="caption" weight="medium" color="muted">
                {t('chats.actions.title')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowActionsModal(true)}
                className="flex-row items-center"
              >
                <Text variant="caption" weight="medium" className="text-blue-600 mr-1">
                  {t('chats.actions.more')}
                </Text>
                <MoreVertical size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View className="flex-row space-x-2">
              {/* Close Contract */}
              <TouchableOpacity
                onPress={handleCloseContract}
                className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg border ${
                  isContractClosed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
                disabled={isContractClosed}
              >
                <CheckCircle
                  size={16}
                  color={isContractClosed ? '#10b981' : '#6b7280'}
                />
                <Text
                  variant="caption"
                  weight="medium"
                  className={`ml-1 ${
                    isContractClosed ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  {isContractClosed ? t('chats.actions.contractClosed') : t('chats.actions.closeContract')}
                </Text>
              </TouchableOpacity>

              {/* End Conversation */}
              <TouchableOpacity
                onPress={handleEndConversation}
                className="flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg border bg-white border-gray-200"
              >
                <XCircle size={16} color="#6b7280" />
                <Text variant="caption" weight="medium" className="ml-1 text-gray-600">
                  {t('chats.actions.endConversation')}
                </Text>
              </TouchableOpacity>

              {/* Block Professional */}
              <TouchableOpacity
                onPress={handleBlockProfessional}
                className="flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg border bg-white border-gray-200"
              >
                <Shield size={16} color="#6b7280" />
                <Text variant="caption" weight="medium" className="ml-1 text-gray-600">
                  {t('chats.actions.block')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Messages */}
        {isContractClosed && (
          <View className="bg-green-50 border-t border-green-200 px-4 py-2">
            <View className="flex-row items-center">
              <CheckCircle size={16} color="#10b981" />
              <Text variant="caption" weight="medium" className="ml-2 text-green-800">
                {t('chats.status.contractClosed')}
              </Text>
            </View>
          </View>
        )}

        {isConversationEnded && (
          <View className="bg-gray-50 border-t border-gray-200 px-4 py-2">
            <View className="flex-row items-center">
              <XCircle size={16} color="#6b7280" />
              <Text variant="caption" weight="medium" className="ml-2 text-gray-600">
                {t('chats.status.conversationEnded')}
              </Text>
            </View>
          </View>
        )}

        {isProfessionalBlocked && (
          <View className="bg-red-50 border-t border-red-200 px-4 py-2">
            <View className="flex-row items-center">
              <Shield size={16} color="#ef4444" />
              <Text variant="caption" weight="medium" className="ml-2 text-red-800">
                {t('chats.status.professionalBlocked')}
              </Text>
            </View>
          </View>
        )}

        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <Input
              value={messageText}
              onChangeText={setMessageText}
              placeholder={t('chats.detail.placeholder')}
              containerClassName="flex-1 mb-0"
              rightIcon={
                <TouchableOpacity>
                  <Paperclip size={20} color="#6B7280" />
                </TouchableOpacity>
              }
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="ml-2 w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <Text variant="h3" weight="bold" className="mb-4">
              {t('chats.actions.modal.title')}
            </Text>

            <View className="space-y-3">
              {/* Close Contract */}
              <TouchableOpacity
                onPress={() => {
                  setShowActionsModal(false);
                  handleCloseContract();
                }}
                className={`flex-row items-center p-4 rounded-lg border ${
                  isContractClosed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
                disabled={isContractClosed}
              >
                <CheckCircle
                  size={20}
                  color={isContractClosed ? '#10b981' : '#6b7280'}
                />
                <View className="ml-3 flex-1">
                  <Text
                    variant="body"
                    weight="medium"
                    className={isContractClosed ? 'text-green-600' : 'text-gray-900'}
                  >
                    {isContractClosed ? t('chats.actions.contractClosed') : t('chats.actions.closeContract')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {t('chats.actions.closeContractDetails.description')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* End Conversation */}
              <TouchableOpacity
                onPress={() => {
                  setShowActionsModal(false);
                  handleEndConversation();
                }}
                className="flex-row items-center p-4 rounded-lg border bg-white border-gray-200"
              >
                <XCircle size={20} color="#6b7280" />
                <View className="ml-3 flex-1">
                  <Text variant="body" weight="medium" className="text-gray-900">
                    {t('chats.actions.endConversation')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {t('chats.actions.endConversationDetails.description')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Block Professional */}
              <TouchableOpacity
                onPress={() => {
                  setShowActionsModal(false);
                  handleBlockProfessional();
                }}
                className="flex-row items-center p-4 rounded-lg border bg-white border-gray-200"
              >
                <Shield size={20} color="#6b7280" />
                <View className="ml-3 flex-1">
                  <Text variant="body" weight="medium" className="text-gray-900">
                    {t('chats.actions.blockProfessional')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {t('chats.actions.blockProfessionalDetails.description')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Report Professional */}
              <TouchableOpacity
                onPress={() => {
                  setShowActionsModal(false);
                  handleReportProfessional();
                }}
                className="flex-row items-center p-4 rounded-lg border bg-white border-gray-200"
              >
                <AlertTriangle size={20} color="#6b7280" />
                <View className="ml-3 flex-1">
                  <Text variant="body" weight="medium" className="text-gray-900">
                    {t('chats.actions.reportProfessional')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {t('chats.actions.reportProfessionalDetails.description')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="mt-6 bg-gray-200 py-4 rounded-xl active:bg-gray-300"
              onPress={() => setShowActionsModal(false)}
            >
              <Text className="text-gray-700 font-semibold text-center text-base">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <Text variant="h3" weight="bold" className="mb-3 text-center">
              {confirmAction?.title}
            </Text>
            <Text variant="body" color="muted" className="mb-6 text-center leading-6">
              {confirmAction?.message}
            </Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl active:bg-gray-300"
                onPress={() => setShowConfirmModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center text-base">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${
                  confirmAction?.isDestructive
                    ? 'bg-red-500 active:bg-red-600'
                    : 'bg-blue-500 active:bg-blue-600'
                }`}
                onPress={() => {
                  confirmAction?.onConfirm();
                }}
              >
                <Text className="text-white font-semibold text-center text-base">
                  {confirmAction?.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

