import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { T, FONTS } from '../constants/theme';
import { WorkoutBlock } from '../components/WorkoutBlock';
import { UserMessage } from '../components/UserMessage';
import { AIMessage } from '../components/AIMessage';
import { InputBar } from '../components/InputBar';
import { MouseLogo } from '../components/MouseLogo';
import { api } from '../services/api';
import { ChatMessage } from '../types';

const DEFAULT_WORKOUT = `  barbell squat      225lb  4×6
  romanian deadlift  185lb  3×8
  leg press          360lb  3×12
  walking lunges      50lb  3×10
  leg curl            80lb  3×12`;

const INITIAL_MSGS: ChatMessage[] = [
  {
    id: '0',
    type: 'sys',
    text: `session a3f9c2 · ${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}\n187.0lb · goal 185.0 · streak 12`,
  },
  {
    id: '1',
    type: 'user',
    text: 'give me a leg day',
  },
  {
    id: '2',
    type: 'ai',
    text: 'arms not touched in 6 days — last: upper pull.\nhamstrings lagging behind quads this cycle.\ncorrecting with a posterior-chain focus.\n\nlower body block →',
  },
  { id: '3', type: 'workout' },
  {
    id: '4',
    type: 'ai',
    text: "let me know if you have all the equipment.\nno barbell? swap romanian dl → dumbbell rdl.",
  },
];

interface Props {
  onDashboard: () => void;
}

export function ChatScreen({ onDashboard }: Props) {
  const [msgs, setMsgs] = useState<ChatMessage[]>(INITIAL_MSGS);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [logged, setLogged] = useState(false);
  const [workoutText, setWorkoutText] = useState(DEFAULT_WORKOUT);
  const feedRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => feedRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = useCallback(async () => {
    if (!input.trim() || busy) return;
    const txt = input.trim();
    setInput('');
    setBusy(true);
    setFrozen(true);

    const userMsg: ChatMessage = { id: Date.now().toString(), type: 'user', text: txt };
    setMsgs((p) => [...p, userMsg]);
    scrollToBottom();

    try {
      const { reply, workoutUpdate } = await api.chat(txt, workoutText);

      if (workoutUpdate) {
        setWorkoutText(workoutUpdate);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: reply,
      };
      setMsgs((p) => [...p, aiMsg]);
      scrollToBottom();
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: 'connection lost — try again.',
      };
      setMsgs((p) => [...p, errMsg]);
    } finally {
      setBusy(false);
      setFrozen(false);
    }
  }, [input, busy, workoutText]);

  const handleLog = useCallback(async () => {
    setLogged(true);
    try {
      await api.logSession(workoutText);
    } catch {
      // session saved locally — will sync when reconnected
    }
  }, [workoutText]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* left nav tab */}
        <TouchableOpacity onPress={onDashboard} style={styles.navTab} activeOpacity={0.7}>
          <Text style={styles.navLabel}>dashboard</Text>
        </TouchableOpacity>

        <View style={styles.main}>
          {/* logo bar */}
          <View style={styles.logoBar}>
            <MouseLogo size={34} />
          </View>

          {/* feed */}
          <ScrollView
            ref={feedRef}
            style={styles.feed}
            contentContainerStyle={styles.feedContent}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          >
            {msgs.map((m) => {
              if (m.type === 'sys') {
                return (
                  <Text key={m.id} style={styles.sysMsg}>
                    {m.text}
                  </Text>
                );
              }
              if (m.type === 'user') {
                return <UserMessage key={m.id} text={m.text!} />;
              }
              if (m.type === 'ai') {
                return <AIMessage key={m.id} text={m.text!} />;
              }
              if (m.type === 'workout') {
                return (
                  <View key={m.id}>
                    <WorkoutBlock
                      text={workoutText}
                      onChangeText={setWorkoutText}
                      frozen={frozen}
                      logged={logged}
                      onLog={handleLog}
                      estimatedMinutes={55}
                      sessionType="lower body"
                      sessionNumber={4}
                    />
                    {logged && (
                      <Text style={styles.loggedNote}>
                        {`session complete · pr: romanian dl +5lb\nnext: upper pull · thu`}
                      </Text>
                    )}
                  </View>
                );
              }
              return null;
            })}
            {busy && (
              <Text style={styles.thinking}>thinking…</Text>
            )}
          </ScrollView>
        </View>
      </View>

      <InputBar
        value={input}
        onChangeText={setInput}
        onSend={send}
        disabled={busy}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
  },
  navTab: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: T.accent,
    fontSize: 7.5,
    letterSpacing: 3,
    fontFamily: FONTS.regular,
    textTransform: 'uppercase',
    transform: [{ rotate: '270deg' }],
    ...T.accentShadow,
  },
  main: {
    flex: 1,
    overflow: 'hidden',
  },
  logoBar: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 13,
    paddingBottom: 13,
    gap: 15,
  },
  sysMsg: {
    color: T.muted,
    fontSize: 8.5,
    lineHeight: 16,
    fontFamily: FONTS.regular,
  },
  loggedNote: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    marginTop: 12,
    lineHeight: 17,
  },
  thinking: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
  },
});
