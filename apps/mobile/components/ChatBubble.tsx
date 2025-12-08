import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { Typography } from './ui';
import { formatDistanceToNow } from 'date-fns';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  createdAt: Date;
}

export interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const relativeTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  // Simple markdown rendering for common patterns
  const renderMarkdown = (text: string) => {
    // This is a simplified version. For production, consider using react-native-markdown-display
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return (
      <Typography
        variant="body"
        color={message.isUser ? 'inverse' : 'primary'}
        style={styles.messageText}
      >
        {parts.map((part, index) => {
          // Bold text
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Typography
                key={index}
                variant="body"
                color={message.isUser ? 'inverse' : 'primary'}
                style={{ fontWeight: typography.fontWeight.bold }}
              >
                {part.slice(2, -2)}
              </Typography>
            );
          }
          // Inline code
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <Typography
                key={index}
                variant="body"
                style={[
                  styles.inlineCode,
                  message.isUser && styles.inlineCodeUser,
                ]}
              >
                {part.slice(1, -1)}
              </Typography>
            );
          }
          return part;
        })}
      </Typography>
    );
  };

  return (
    <View
      style={[
        styles.container,
        message.isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          message.isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {renderMarkdown(message.content)}
      </View>

      <Typography
        variant="caption"
        color="tertiary"
        style={[
          styles.timestamp,
          message.isUser ? styles.userTimestamp : styles.assistantTimestamp,
        ]}
      >
        {relativeTime}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: typography.lineHeight.base * 1.2,
  },
  inlineCode: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing.xs / 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontFamily: 'monospace',
    fontSize: typography.fontSize.sm,
  },
  inlineCodeUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: colors.text.inverse,
  },
  timestamp: {
    marginTop: spacing.xs / 2,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  assistantTimestamp: {
    textAlign: 'left',
  },
});
