/** @jsxImportSource nativewind */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MoreVertical, Paperclip, Send, ChevronDown } from 'lucide-react-native';
import {
  Screen,
  Text,
  Avatar,
  ChatBubble,
  Input,
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
  } = useChats();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
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
      } catch (error) {
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
      setPendingConversation(clientId, professionalId, professionalName, professionalAvatar);
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
          { clientId, professionalId }
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3">
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
    </SafeAreaView>
  );
}

