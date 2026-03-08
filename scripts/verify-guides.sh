#!/bin/bash

# Verify all React V6 guides exist and have valid frontmatter

echo "🔍 Verifying React V6 Guides..."
echo ""

GUIDES_DIR="ui-kit/react/guides"
MISSING=0
INVALID=0

# List of all expected guides
GUIDES=(
  "getting-started/react-js.mdx"
  "getting-started/next-js.mdx"
  "getting-started/react-router.mdx"
  "getting-started/astro.mdx"
  "chat-features/conversations.mdx"
  "chat-features/messaging.mdx"
  "chat-features/users.mdx"
  "chat-features/groups.mdx"
  "chat-features/group-members.mdx"
  "chat-features/search.mdx"
  "chat-features/message-composer.mdx"
  "chat-features/message-list.mdx"
  "chat-features/message-header.mdx"
  "chat-features/message-templates.mdx"
  "chat-features/message-bubbles.mdx"
  "chat-features/message-information.mdx"
  "chat-features/threaded-messages.mdx"
  "chat-features/reactions.mdx"
  "chat-features/core-features.mdx"
  "calling-features/voice-video.mdx"
  "calling-features/call-buttons.mdx"
  "calling-features/incoming-call.mdx"
  "calling-features/outgoing-call.mdx"
  "calling-features/ongoing-call.mdx"
  "calling-features/call-logs.mdx"
  "ai-features/ai-assistant.mdx"
  "ai-features/ai-assistant-chat.mdx"
  "ai-features/smart-replies.mdx"
  "ai-features/conversation-starters.mdx"
  "ai-features/conversation-summary.mdx"
  "advanced/theming.mdx"
  "advanced/localization.mdx"
  "advanced/events.mdx"
  "advanced/methods.mdx"
  "advanced/sound-manager.mdx"
  "advanced/extensions.mdx"
  "advanced/polls.mdx"
  "advanced/stickers.mdx"
  "advanced/collaborative-whiteboard.mdx"
  "advanced/collaborative-document.mdx"
  "advanced/message-translation.mdx"
  "advanced/custom-formatters.mdx"
  "advanced/mentions-formatter.mdx"
  "advanced/url-formatter.mdx"
  "advanced/shortcut-formatter.mdx"
)

for guide in "${GUIDES[@]}"; do
  filepath="$GUIDES_DIR/$guide"
  
  if [ ! -f "$filepath" ]; then
    echo "❌ MISSING: $filepath"
    ((MISSING++))
  else
    # Check for valid frontmatter (starts with ---)
    if head -1 "$filepath" | grep -q "^---"; then
      # Check for title in frontmatter
      if head -10 "$filepath" | grep -q "^title:"; then
        echo "✅ $guide"
      else
        echo "⚠️  NO TITLE: $filepath"
        ((INVALID++))
      fi
    else
      echo "⚠️  NO FRONTMATTER: $filepath"
      ((INVALID++))
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   Total guides expected: ${#GUIDES[@]}"
echo "   Missing files: $MISSING"
echo "   Invalid frontmatter: $INVALID"

if [ $MISSING -eq 0 ] && [ $INVALID -eq 0 ]; then
  echo ""
  echo "✅ All guides verified successfully!"
  exit 0
else
  echo ""
  echo "❌ Some guides have issues. Please fix before deploying."
  exit 1
fi
