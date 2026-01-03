import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import Tts from 'react-native-tts';

/* ===================== SCREEN SIZE ===================== */
const { width, height } = Dimensions.get('window');

/* ===================== RESPONSIVE HELPERS ===================== */
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/* ===================== DEMO QUESTIONS ===================== */
const DEMO_QUESTIONS = [
  {
    id: 1,
    question: 'What is the capital of India?',
    options: ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'],
    correctAnswer: 1,
    explanation: 'Delhi is the capital of India.',
    difficulty: 'easy',
    category: 'Geography',
  },
  {
    id: 2,
    question: 'Which data structure follows FIFO?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 1,
    explanation: 'Queue follows First In First Out.',
    difficulty: 'medium',
    category: 'Computer Science',
  },
  {
    id: 3,
    question: 'Who wrote the Ramayana?',
    options: ['Tulsidas', 'Kalidas', 'Valmiki', 'Ved Vyasa'],
    correctAnswer: 2,
    explanation: 'Ramayana was written by Maharishi Valmiki.',
    difficulty: 'easy',
    category: 'History',
  },
];

/* ===================== MAIN COMPONENT ===================== */
const CheckAttempted = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingQuestionId, setSpeakingQuestionId] = useState(null);


  /* ===================== DATA ===================== */
  const questions =
    route?.params?.questions?.length > 0
      ? route.params.questions
      : DEMO_QUESTIONS;

  const userAnswers = route?.params?.userAnswers || [1, 0, 2];
  const timeTaken = route?.params?.timeTaken || 180;

  /* ===================== PROCESS QUESTIONS ===================== */
  const processedQuestions = useMemo(() => {
    return questions.map((q, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === q.correctAnswer;

      return {
        ...q,
        index: index + 1,
        userAnswer,
        isCorrect,
        timeSpent: `${Math.floor(timeTaken / questions.length)}s`,
      };
    });
  }, [questions, userAnswers]);

  const filteredQuestions = useMemo(() => {
    if (activeTab === 'correct')
      return processedQuestions.filter(q => q.isCorrect);
    if (activeTab === 'wrong')
      return processedQuestions.filter(q => !q.isCorrect);
    return processedQuestions;
  }, [activeTab, processedQuestions]);

  const total = processedQuestions.length;
  const correct = processedQuestions.filter(q => q.isCorrect).length;
  const wrong = total - correct;

  /* ===================== TOGGLE EXPAND ===================== */
  const toggleExpand = id => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* ===================== HEADER ===================== */
  const Header = () => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={18} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Attempted Questions</Text>
      <View style={{ width: 20 }} />
    </View>
  );

  useEffect(() => {
    let startListener, finishListener, cancelListener;

    const initTts = async () => {
      try {
        await Tts.getInitStatus();
        Tts.setDefaultLanguage('en-US');
        Tts.setDefaultRate(0.5);
        Tts.setDefaultPitch(1.0);

        startListener = Tts.addEventListener('tts-start', () =>
          setIsSpeaking(true),
        );
        finishListener = Tts.addEventListener('tts-finish', () => {
          setIsSpeaking(false);
          setSpeakingQuestionId(null);
        });
        cancelListener = Tts.addEventListener('tts-cancel', () => {
          setIsSpeaking(false);
          setSpeakingQuestionId(null);
        });
      } catch (err) {
        console.log('TTS init error', err);
      }
    };

    initTts();

    return () => {
      startListener?.remove();
      finishListener?.remove();
      cancelListener?.remove();
      Tts.stop();
    };
  }, []);


  /* ===================== STATS ===================== */
  const Stats = () => (
    <LinearGradient
      colors={['#F87F16', '#FFA726']}
      style={styles.statsCard}
    >
      <StatItem label="Total" value={total} />
      <StatItem label="Correct" value={correct} color="#4CAF50" />
      <StatItem label="Wrong" value={wrong} color="#F44336" />
    </LinearGradient>
  );

  const StatItem = ({ label, value, color = '#fff' }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  /* ===================== TABS ===================== */
  const Tabs = () => (
    <View style={styles.tabs}>
      {['all', 'correct', 'wrong'].map(tab => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab,
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  const handleAudioExplanation = async (question) => {
    try {
      // Stop if same question audio is playing
      if (isSpeaking && speakingQuestionId === question.id) {
        await Tts.stop();
        setIsSpeaking(false);
        setSpeakingQuestionId(null);
        return;
      }

      if (!question.explanation) {
        Alert.alert('No Audio', 'Explanation not available');
        return;
      }

      const correctOption =
        question.options?.[question.correctAnswer] || '';

      const textToSpeak = `
      Explanation.
      ${question.explanation}.
      The correct answer is ${correctOption}.
    `;

      setSpeakingQuestionId(question.id);
      Tts.speak(textToSpeak);
    } catch (error) {
      console.log('Audio error', error);
    }
  };


  /* ===================== QUESTION CARD ===================== */
  const renderItem = ({ item }) => {
    const isOpen = expanded[item.id];

    return (
      <View
        style={[
          styles.card,
          {
            borderLeftColor: item.isCorrect ? '#4CAF50' : '#F44336',
          },
        ]}
      >
        {/* HEADER */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.qLeft}>
            <View
              style={[
                styles.qNumber,
                {
                  backgroundColor: item.isCorrect
                    ? '#4CAF50'
                    : '#F44336',
                },
              ]}
            >
              <Text style={styles.qNumberText}>{item.index}</Text>
            </View>

            <View style={styles.qInfo}>
              <Text numberOfLines={2} style={styles.qText}>
                {item.question}
              </Text>

              <View style={styles.meta}>
                <Text style={styles.metaText}>
                  Time: {item.timeSpent}
                </Text>
                <Text
                  style={[
                    styles.badge,
                    {
                      color: item.isCorrect
                        ? '#4CAF50'
                        : '#F44336',
                    },
                  ]}
                >
                  {item.isCorrect ? 'Correct' : 'Wrong'}
                </Text>
              </View>
            </View>
          </View>

          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#555"
          />
        </TouchableOpacity>

        {/* EXPANDED */}
        {isOpen && (
          <View style={styles.expand}>
            {item.options.map((opt, i) => {
              const isCorrect = i === item.correctAnswer;
              const isUser = i === item.userAnswer;

              return (
                <View
                  key={i}
                  style={[
                    styles.option,
                    isCorrect && styles.correct,
                    isUser && !isCorrect && styles.wrong,
                  ]}
                >
                  <Text style={styles.optionText}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </Text>
                </View>
              );
            })}

            <Text style={styles.explanation}>
              {item.explanation}
            </Text>
            <TouchableOpacity
              style={[
                styles.audioButton,
                isSpeaking && speakingQuestionId === item.id && styles.audioButtonActive,
              ]}
              onPress={() => handleAudioExplanation(item)}
            >
              <Icon
                name={
                  isSpeaking && speakingQuestionId === item.id
                    ? 'pause-circle'
                    : 'volume-up'
                }
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.audioButtonText}>
                {isSpeaking && speakingQuestionId === item.id
                  ? 'Stop Audio'
                  : 'Audio Explanation'}
              </Text>
            </TouchableOpacity>

          </View>
        )}
      </View>
    );
  };

  /* ===================== RENDER ===================== */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F87F16" />

      <Header />

      <FlatList
        ListHeaderComponent={
          <>
            <Stats />
            <Tabs />
          </>
        }
        data={filteredQuestions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CheckAttempted;

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#F87F16',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  statsCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { color: '#fff' },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  activeTab: { backgroundColor: '#F87F16' },
  tabText: { color: '#555' },
  activeTabText: { color: '#fff', fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qLeft: { flexDirection: 'row', flex: 1 },
  qNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qNumberText: { color: '#fff', fontWeight: '700' },
  qInfo: { marginLeft: 10, flex: 1 },
  qText: { fontSize: 14, fontWeight: '500' },

  meta: { flexDirection: 'row', marginTop: 4 },
  metaText: { fontSize: 12, color: '#777', marginRight: 10 },
  badge: { fontSize: 12, fontWeight: '600' },

  expand: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  option: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 6,
  },
  correct: { backgroundColor: '#E8F5E9' },
  wrong: { backgroundColor: '#FFEBEE' },
  optionText: { fontSize: 13 },

  explanation: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
  },
  audioButton: {
  marginTop: 12,
  backgroundColor: '#1A3848',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

audioButtonActive: {
  backgroundColor: '#F87F16',
},

audioButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},

});
