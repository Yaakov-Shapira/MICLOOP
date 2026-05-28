import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { subscribeMessages, sendMessage } from '../../lib/firestore';
import { useAppStore } from '../../store/appStore';
import type { Message } from '../../types';

interface Props {
  loopId: string;
}

export default function ChatPanel({ loopId }: Props) {
  const { user, isAuthenticated, showGate } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => subscribeMessages(loopId, (msgs) => {
    setMessages(msgs);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }), [loopId]);

  async function handleSend() {
    if (!text.trim()) return;
    if (!isAuthenticated || !user) { showGate(); return; }
    const msg = text.trim();
    setText('');
    await sendMessage(loopId, {
      userId: user.uid,
      name: user.name,
      avatar: user.avatar,
      text: msg,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.heading}>{t('room.chat')}</Text>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.msgRow, item.userId === user?.uid && styles.myMsgRow]}>
            <Text style={styles.msgAvatar}>{item.avatar}</Text>
            <View style={[styles.bubble, item.userId === user?.uid && styles.myBubble]}>
              {item.userId !== user?.uid && (
                <Text style={styles.msgName}>{item.name}</Text>
              )}
              <Text style={[styles.msgText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          value={text}
          onChangeText={setText}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={Colors.text3}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.text1,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  list: { padding: Spacing.md, gap: 8 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  myMsgRow: { flexDirection: 'row-reverse' },
  msgAvatar: { fontSize: 20 },
  bubble: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  myBubble: { backgroundColor: Colors.accent + '33', borderColor: Colors.accent + '44' },
  msgName: { fontFamily: Fonts.semibold, fontSize: 11, color: Colors.accentLight, marginBottom: 2 },
  msgText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text1 },
  inputRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
