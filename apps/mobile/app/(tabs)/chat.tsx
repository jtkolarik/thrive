import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useChildren } from '../../hooks/useChildren';
import { useChat } from '../../hooks/useChat';
import { ChatBubble } from '../../components/ChatBubble';
import { ChildSelector } from '../../components/ChildSelector';
import { Typography, EmptyState } from '../../components/ui';
import { formatAge } from '../../lib/utils';

interface SuggestedPrompt {
  id: string;
  text: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { children, selectedChild, selectChild } = useChildren(user?.id);
  const {
    messages,
    sending,
    loading,
    sendMessage,
    startNewConversation,
    clearConversation,
  } = useChat(user?.id, selectedChild?.id);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const getSuggestedPrompts = useCallback((): SuggestedPrompt[] => {
    const childName = selectedChild?.name || 'my child';
    const childAge = selectedChild?.date_of_birth
      ? formatAge(new Date(selectedChild.date_of_birth))
      : '';

    return [
      {
        id: '1',
        text: `What milestones should ${childName} be hitting?`,
      },
      {
        id: '2',
        text: `Tips for sleep training at ${childAge || 'this age'}`,
      },
      {
        id: '3',
        text: `What's normal behavior for a ${childAge || 'toddler'}?`,
      },
      {
        id: '4',
        text: `Help me understand why ${childName} has tantrums`,
      },
    ];
  }, [selectedChild]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    try {
      await sendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [inputText, sending, sendMessage]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInputText(prompt);
  }, []);

  const handleNewConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  const handleChildSelect = useCallback((childId: string | null) => {
    const child = childId ? children.find((c) => c.id === childId) || null : null;
    selectChild(child);
    clearConversation();
  }, [children, selectChild, clearConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = useCallback(({ item }: { item: any }) => (
    <ChatBubble
      message={{
        id: item.id,
        content: item.content,
        isUser: item.role === 'user',
        createdAt: new Date(item.created_at),
      }}
    />
  ), []);

  const renderHeader = useCallback(() => (
    <View style={styles.chatHeader}>
      <View style={styles.headerRow}>
        <View>
          <Typography variant="h2">Thrive Copilot</Typography>
          <Typography variant="caption" color="secondary">
            Chatting about: {selectedChild?.name || 'All children'}
          </Typography>
        </View>
        <Pressable onPress={handleNewConversation} style={styles.newChatButton}>
          <Ionicons name="create-outline" size={24} color={colors.primary[500]} />
        </Pressable>
      </View>

      {children.length > 1 && (
        <View style={styles.childSelectorContainer}>
          <ChildSelector
            selectedChildId={selectedChild?.id || null}
            onSelect={handleChildSelect}
            children={children}
          />
        </View>
      )}
    </View>
  ), [selectedChild, children, handleChildSelect, handleNewConversation]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.welcomeSection}>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={40} color={colors.primary[500]} />
        </View>
        <Typography variant="h2" style={styles.welcomeTitle}>
          Hi! I'm your parenting copilot
        </Typography>
        <Typography variant="body" color="secondary" style={styles.welcomeText}>
          I'm here to help answer questions, offer support, and celebrate milestones with you.
          {selectedChild ? ` Ask me anything about ${selectedChild.name}!` : ''}
        </Typography>
      </View>

      <View style={styles.suggestionsSection}>
        <Typography variant="label" style={styles.suggestionsLabel}>
          Suggested prompts
        </Typography>
        <View style={styles.suggestionsContainer}>
          {getSuggestedPrompts().map((prompt) => (
            <Pressable
              key={prompt.id}
              style={styles.suggestionChip}
              onPress={() => handleSuggestedPrompt(prompt.text)}
            >
              <Typography variant="body" style={styles.suggestionText}>
                {prompt.text}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  ), [selectedChild, getSuggestedPrompts, handleSuggestedPrompt]);

  const renderTypingIndicator = useCallback(() => {
    if (!sending) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  }, [sending]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {renderHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderTypingIndicator}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.messagesListEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* Suggested prompts when conversation has messages */}
        {messages.length > 0 && messages.length < 3 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.inlineSuggestions}
            contentContainerStyle={styles.inlineSuggestionsContent}
          >
            {getSuggestedPrompts().slice(0, 3).map((prompt) => (
              <Pressable
                key={prompt.id}
                style={styles.inlineSuggestionChip}
                onPress={() => handleSuggestedPrompt(prompt.text)}
              >
                <Typography variant="caption" numberOfLines={1}>
                  {prompt.text}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={2000}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? colors.background : colors.text.tertiary}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  chatHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newChatButton: {
    padding: spacing.sm,
  },
  childSelectorContainer: {
    marginTop: spacing.sm,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messagesListEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  aiIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  suggestionsSection: {
    gap: spacing.md,
  },
  suggestionsLabel: {
    color: colors.text.secondary,
  },
  suggestionsContainer: {
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  suggestionText: {
    color: colors.text.primary,
  },
  inlineSuggestions: {
    maxHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  inlineSuggestionsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  inlineSuggestionChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxWidth: 200,
  },
  typingContainer: {
    paddingVertical: spacing.sm,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxWidth: 80,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[400],
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
});
