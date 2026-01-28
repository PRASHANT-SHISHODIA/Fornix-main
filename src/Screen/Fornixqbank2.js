// Fornixqbank2.js
import React, { useState, useEffect, useRef, } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
  BackHandler,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
// import { useQuizStore } from '../API/store/useQuizStore';
import useQuizStore from '../store/useQuizStore';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen dimensions
const { width, height } = Dimensions.get('window');

// 🔹 Responsive scaling
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 🔹 Responsive size function based on screen width
const getResponsiveSize = size => {
  if (width < 375) {
    // Small phones
    return size * 0.85;
  } else if (width > 414) {
    // Large phones
    return size * 1.15;
  }
  return size; // Normal phones
};

// 🔹 Get responsive transform values for header
const getHeaderTransform = () => {
  if (width < 375) return 1.6; // Small phones
  if (width > 414) return 1.8; // Large phones
  return 1.7; // Normal phones
};

// 🔹 Get responsive search container transform
const getSearchTransform = () => {
  if (width < 375) return 0.62; // Small phones
  if (width > 414) return 0.55; // Large phones
  return 0.58; // Normal phones
};

const Fornixqbank2 = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, testId, topicId, topicName = 'Anatomy', mood, chapterId, ChapterName, subjectId, Course } = route.params || {};
  const Difficult = mood?.title ?? null
  console.log("mood in quiz", Difficult)
  console.log("p", route.params)
  console.log("SUBJECT ID IN FORNIX QBANK2", subjectId)
  console.log("COURSE IN FORNIX QBANK2", Course)
  console.log('mode and mocktestid', testId, mode)


  const getQuestionTypeFromMood = (moodTitle) => {
    switch (moodTitle) {
      case 'Funny / Easy':
        return 'easy';
      case 'Moderate':
        return 'medium';
      case 'Competitive':
      case 'Difficult':
        return 'hard';
      default:
        return 'easy';
    }
  };


  // 🔹 State variables
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPrevPressed, setIsPrevPressed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const hasAnsweredCurrent = useRef(false);
  const isLastQuestion = currentIndex === questions.length - 1;
  const canSubmit = isLastQuestion && hasAnsweredCurrent.current;
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [userId, setUserId] = useState(null);
  const [attempted, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submitProgress = useRef(new Animated.Value(0)).current;
  const saveAnswer = useQuizStore((state) => state.saveAnswer);
  const getAnswer = useQuizStore((state) => state.getAnswer);
  // const route = useRoute()

  console.log("USER ID ", userId)
  // Track if user has answered current question

  const currentQuestion = questions[currentIndex];

  // 🔹 Animated loader
  useEffect(() => {
    let animation;
    if (loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    }

    return () => animation?.stop();
  }, [loading]);



  // 🔹 Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress,
    );
    return () => backHandler.remove();
  }, []);

  const callMockTestStartApi = async () => {
    if (!userId || !testId) {
      console.log('❌ Missing userId or testId');
      return;
    }

    try {
      setLoading(true);

      const url = `https://fornix-medical.vercel.app/api/v1/mobile/mock-tests/${testId}/start`;

      const response = await axios.post(url, {
        user_id: userId,
      });

      if (response?.data?.success) {
        setAttemptId(response.data.attempt?.id);
        setQuestions(response.data.questions || []);
        setCurrentIndex(0);

        console.log('✅ MOCK TEST STARTED');
      } else {
        Alert.alert('Error', 'Mock Test start failed');
      }
    } catch (error) {
      console.log(
        '❌ MOCK TEST API ERROR:',
        error?.response?.data || error.message
      );
      Alert.alert('Error', 'Unable to start mock test');
    } finally {
      setLoading(false);
    }
  };


  const callSubjectQuizApi = async () => {
    if (!userId || !subjectId || !mood) {
      console.log('❌ Missing data for subject quiz');
      return;
    }

    try {
      setLoading(true);

      const questionType = getQuestionTypeFromMood(mood.title);

      const body = {
        user_id: userId,
        subject_id: subjectId,
        question_type: questionType,
        limit: 20,
      };

      console.log('📤 SUBJECT QUIZ BODY:', body);

      const response = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/subject-quiz/start',
        body
      );

      if (response?.data?.success) {
        setQuestions(response.data.data);
        setAttemptId(response.data.attempt_id);
        setCurrentIndex(0);

        console.log('✅ SUBJECT QUIZ LOADED');
        console.log('ATTEMPT:', response.data.attempt_id);
        console.log('QUESTIONS:', response.data);
      } else {
        Alert.alert('Error', 'Subject quiz failed');
      }
    } catch (error) {
      console.log(
        '❌ SUBJECT QUIZ ERROR:',
        error?.response?.data || error.message
      );
      Alert.alert('Error', 'Unable to load subject quiz');
    } finally {
      setLoading(false);
    }
  };


  // 🔹 API Calls
  const callDirectQuizApi = async () => {
    try {
      setLoading(true);
      const body = {
        user_id: userId,
        chapter_id: chapterId,
        limit: 20,
      };
      const response = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/quiz/start',
        body,
      );
      if (response.data.success) {
        setQuestions(response?.data?.data);
        setAttemptId(response?.data?.attempt_id);
        setCurrentIndex(0)
        console.log('Quiz data :', response?.data?.data);
        console.log("ATTEMPT ID :", response?.data?.attempt_id)
      }
    } catch (error) {
      console.log("QUIZ ERROR ", error.response?.data || error.message)
      Alert.alert('Error', 'Direct Quiz Is Not responding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      setUserId(storedUserId);
    };
    getUserId();
  }, [])

  const callTopicQuizApi = async () => {

    if (!userId) {
      console.log("userId Not Ready, skipping API");
      return;
    }
    try {
      setLoading(true);
      const body = {
        user_id: userId,
        "topic_ids": ["fc28caf5-1f7f-47bb-a19e-4572c8a0f2d0", "fbc98178-89dc-442c-9fcc-c0b819e3365a"],
        limit: 25,
      };

      console.log("TOPIC BODY:", body);
      const response = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/quiz/start',
        body,
      );
      if (response?.data?.success) {
        setQuestions(response.data.data);
        setAttemptId(response?.data?.attempt_id)
        setCurrentIndex(0);
        console.log('TOPIC QUIZ DATA', response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Topic quiz Api failed');
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // ✅ MOCK TEST FLOW
    if (mode === 'MOCK_TEST' && testId) {
      callMockTestStartApi();
      return;
    }

    // ✅ SUBJECT (AMC) FLOW
    if (mood && subjectId) {
      callSubjectQuizApi();
      return;
    }

    // ✅ TOPIC FLOW
    if (mode === 'topic' && topicId) {
      callTopicQuizApi();
      return;
    }

    // ✅ DIRECT FLOW
    if (mode === 'DIRECT') {
      callDirectQuizApi();
    }

  }, [userId, mode, testId, topicId, mood, subjectId]);


  const handleHardwareBackPress = () => {
    stopTTS();
    navigation.replace('Topicwise');
    return true;
  };

  const stopTTS = async () => {
    try {
      await Tts.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.log('TTS Stop Error:', error);
    }
  };

  const handleOptionSelect = optionId => {
    if (hasAnsweredCurrent.current) return; // Prevent multiple answers

    setSelectedOption(optionId);
    setShowExplanation(true);
    hasAnsweredCurrent.current = true;

    // Track user answer
    const isCorrect = currentQuestion.correct_answer && optionId === currentQuestion.correct_answer;
    const answerRecord = {
      questionId: currentQuestion.id,
      question: currentQuestion.question_text,
      selected: optionId,
      correct: currentQuestion.correct_answer,
      isCorrect: isCorrect,
    };

    setUserAnswers(prev => [...prev, answerRecord]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const getSavedAnswer = (questionId) => {
    return userAnswers.find(a => a.questionId === questionId);
  }

  const handlePrevious = () => {
    stopTTS();
    if (currentIndex === 0) return
    const prevIndex = currentIndex - 1;
    const prevQuestion = questions[prevIndex];

    const savedAnswer = getSavedAnswer(prevQuestion.id)

    setCurrentIndex(prevIndex);

    if (savedAnswer) {
      setSelectedOption(savedAnswer.selected);
      setShowExplanation(true);
      hasAnsweredCurrent.current = true;
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
      hasAnsweredCurrent.current = false;
    }

  };
  useEffect(() => {
    if (questions.length > 0 && !quizStartTime) {
      setQuizStartTime(Date.now());
    }
  }, [questions]);

  const getTimeTakenInSeconds = () => {
    if (!quizStartTime) return 0;
    const endTime = Date.now();
    return Math.floor((endTime - quizStartTime) / 1000);
  };

  const buildSubmitPayload = () => {
    const { answers } = useQuizStore.getState();
    console.log("ANSWER", answers)
    return {
      user_id: userId,
      attempt_id: attempted,
      time_taken_seconds: getTimeTakenInSeconds(),
      answers: answers,
    };
  };

  const startSubmitProgress = () => {
    submitProgress.setValue(0);
    Animated.timing(submitProgress, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();
  }

  const submitAMCQuiz = async () => {
    try {
      setSubmitting(true);
      startSubmitProgress();
      const payload = {
        user_id: userId,
        attempt_id: attempted,
        subject_id: subjectId,
        question_type: getQuestionTypeFromMood(mood.title),
        time_taken_seconds: getTimeTakenInSeconds(),
        answers: useQuizStore.getState().answers,
      };
      console.log('Amc Submit Payload:', JSON.stringify(payload, null, 2));
      const response = await axios.post("https://fornix-medical.vercel.app/api/v1/subject-quiz/submit",
        payload
      );
      console.log("AMC SUBMIT RESPONSE", response);
      if (response?.data?.success) {
        setTimeout(() => {
          setSubmitting(false);
          handleSubmitSuccess(response?.data);
        }, 1800);
      } else {
        setSubmitting(false);
        Alert.alert("Error", "AMC Submission failed");
      }
    } catch (error) {
      console.log("AMC SUBMIT ERROR :", error?.response?.data || error.message);
      Alert.alert("Error", "AMC Quiz Submit Failed");
      setSubmitting(false);
    }
  }

  const SubmitQuiz = async () => {

    // const isAMC = subjectId === subjectId; // Replace with actual AMC subject ID
    const { isAMC = false } = route.params || {};
    if (isAMC) {
      await submitAMCQuiz();
      return;
    }
    try {
      setSubmitting(true);
      startSubmitProgress();
      const payload = buildSubmitPayload();

      const response = await axios.post('https://fornix-medical.vercel.app/api/v1/quiz/submit',
        payload
      );
      if (response?.data?.success) {
        setTimeout(() => {
          setSubmitting(false);
          handleSubmitSuccess(response?.data);
        }, 1800);

        console.log('SUBMIT DATA', response?.data);
      } else {
        setSubmitting(false);
        Alert.alert("Error", "Submission failed");
      }
    } catch (error) {
      console.log("SUBMIT ERROR :", error?.response?.data || error.message);
      Alert.alert("Error", "Quiz Submit Failed");
      setSubmitting(false);
    }
  }

  const handleSubmitSuccess = (data) => {
    navigation.navigate('Results', {
      resultData: data,
      userAnswers: userAnswers,
      questions: questions,
      timeTaken: getTimeTakenInSeconds(),
      outOf: '',
      attemptedId: data?.attempt_id,
      userId: userId,

    })
  }

  const handleBackButton = () => {
    stopTTS();
    navigation.goBack();
  };


  const handleNext = () => {
    if (!hasAnsweredCurrent.current) {
      Alert.alert('Answer Required', 'Please select an answer');
      return;
    }

    const currentQuestion = questions[currentIndex];

    // 🔹 SAVE CURRENT ANSWER
    saveAnswer(currentQuestion.id, selectedOption);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex];
      const savedAnswer = getAnswer(nextQuestion.id);

      setCurrentIndex(nextIndex);

      if (savedAnswer) {
        setSelectedOption(savedAnswer.selected_key);
        setShowExplanation(true);
        hasAnsweredCurrent.current = true;
      } else {
        setSelectedOption(null);
        setShowExplanation(false);
        hasAnsweredCurrent.current = false;
      }

      stopTTS();
    } else {
      SubmitQuiz();
    }
  };

  const navigateToResults = () => {
    const percentage = Math.round((score / questions.length) * 100);

    navigation.navigate('QuizResults', {
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      topicName: ChapterName,
      userAnswers: userAnswers,
      questions: questions,
      timeSpent: '45 mins',
      rank: Math.floor((questions.length - score) * 1.5),
    });
  };




  // 🔹 Custom Loader Component
  const CustomLoader = () => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [widthAnim] = useState(new Animated.Value(0.3));

    useEffect(() => {
      let animation;
      if (loading) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        );
        pulseAnimation.start();

        const widthAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(widthAnim, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: false,
            }),
            Animated.timing(widthAnim, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: false,
            }),
          ]),
        );
        widthAnimation.start();

        animation = {
          pulse: pulseAnimation,
          width: widthAnimation,
        };
      }

      return () => {
        animation?.pulse?.stop();
        animation?.width?.stop();
      };
    }, [loading]);

    return (
      <View style={styles.loaderContainer}>
        <LinearGradient
          colors={['#F87F16', '#FF9800']}
          style={styles.loaderHeader}>
          <View style={styles.loaderHeaderContent}>
            <TouchableOpacity
              style={styles.loaderBackButton}
              onPress={() => navigation.goBack()}>
              <Icon1 name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.loaderTitle}>Loading Quiz</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.loaderContent}>
          <Animated.View
            style={[
              styles.loaderIconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}>
            <LinearGradient
              colors={['#F87F16', '#FF9800']}
              style={styles.loaderIconCircle}>
              <Icon name="brain" size={moderateScale(40)} color="white" />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.loaderMainText}>Preparing Your Medical Quiz</Text>
          <Text style={styles.loaderSubText}>
            Fetching questions from server...
          </Text>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: widthAnim.interpolate({
                    inputRange: [0.3, 0.6],
                    outputRange: ['30%', '60%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  // Main render logic
  if (loading) {
    return <CustomLoader />;
  }

  if (!questions.length || !questions[currentIndex]) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-triangle" size={50} color="#F87F16" />
        <Text style={styles.errorText}>No Questions Found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      {/* 🔹 Submit Progress Overlay */}
      {submitting && (
        <View style={styles.submitOverlay}>
          <Text style={styles.submitTitle}>Submitting Result</Text>

          <View style={styles.submitBarContainer}>
            <Animated.View
              style={[
                styles.submitBarFill,
                {
                  width: submitProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <Text style={styles.submitSubText}>
            Calculating your score...
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleBackButton}
                style={styles.backButton}>
                <Icon1
                  name="arrow-back"
                  size={moderateScale(getResponsiveSize(28))}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.title}>{ChapterName}</Text>
            </View>
            <Text style={styles.sectionTitle1}>Fornix Q Bank</Text>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Question {currentIndex + 1} of {questions.length}
              </Text>
              <View style={styles.loaderprogessbar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 🔹 Question Container */}
        <View style={styles.questionContainer}>
          <Text style={{
            textAlign: 'center', fontSize: 20,
            fontWeight: '700',
          }}>
            {currentQuestion?.question_type}
          </Text>
          {/* 🔹 Question Text */}
          <Text style={styles.questionText}>
            {currentQuestion?.question_text}
          </Text>
          {currentQuestion.question_image_url && (
            <Image
              source={{ uri: currentQuestion.question_image_url }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          )}

          {/* 🔹 Options */}
          <View style={styles.optionsContainer}>
          
            {currentQuestion?.options?.map(option => (
              <TouchableOpacity
                key={option.option_key}
                style={[
                  styles.optionButton,
                  selectedOption === option.option_key && styles.optionSelected,
                  selectedOption &&
                  option.option_key === currentQuestion.correct_answer &&
                  styles.correctOption,
                ]}
                onPress={() => handleOptionSelect(option.option_key)}
                disabled={hasAnsweredCurrent.current}>
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionCircle,
                      selectedOption === option.option_key &&
                      styles.optionCircleSelected,
                      selectedOption &&
                      option.option_key === currentQuestion.correct_answer &&
                      styles.correctOptionCircle,
                    ]}>
                    <Text
                      style={[
                        styles.optionId,
                        selectedOption === option.option_key &&
                        styles.optionIdSelected,
                        selectedOption &&
                        option.option_key ===
                        currentQuestion?.correct_answer &&
                        styles.correctOptionId,
                      ]}>
                      {option.option_key.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option.option_key &&
                      styles.optionTextSelected,
                      selectedOption &&
                      option.option_key === currentQuestion?.correct_answer &&
                      styles.correctOptionText,
                    ]}>
                    {option.content}
                  </Text>
                </View>
                {selectedOption === option.option_key && (
                  <Icon
                    name={
                      option.option_key === currentQuestion.correct_answer
                        ? 'check'
                        : 'times'
                    }
                    size={moderateScale(getResponsiveSize(16))}
                    color={
                      option.option_key === currentQuestion.correct_answer
                        ? '#4CAF50'
                        : '#F44336'
                    }
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔹 Explanation Section */}
          {showExplanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explanation</Text>
                <View style={styles.sectionLine} />
              </View>

              <Text style={styles.exampleText}>
                {currentQuestion.explanation}
              </Text>

              {/* 🔹 Correct Answer Indicator */}
              <View style={styles.correctAnswerContainer}>
                <View style={styles.correctAnswerHeader}>
                  <Icon
                    name="check-circle"
                    size={moderateScale(getResponsiveSize(18))}
                    color="#4CAF50"
                  />
                  <Text style={styles.correctAnswerText}>Correct Answer</Text>
                </View>
                <Text style={styles.correctAnswerValue}>
                  {currentQuestion.correct_answer
                    ? currentQuestion.correct_answer.toUpperCase()
                    : 'Answer will be shown after submission'}
                </Text>

              </View>
            </View>
          )}

          {/* 🔹 Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                isPrevPressed && styles.navButtonPressed,
              ]}
              onPress={handlePrevious}
              onPressIn={() => setIsPrevPressed(true)}
              onPressOut={() => setIsPrevPressed(false)}>
              <Text
                style={[
                  styles.navButtonText,
                  isPrevPressed && styles.navButtonTextPressed,
                ]}>
                {currentIndex === 0 ? 'Previous' : 'Previous'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting || (isLastQuestion && !canSubmit)}
              style={[
                styles.navButton,
                {
                  backgroundColor: submitting
                    ? "#B0BEC5"
                    : isLastQuestion
                      ? canSubmit ? "#4CAF50" : '#A5D6A7'
                      : "#1A3848",
                },
              ]}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>
                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </View>
  );
};

//  Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(getResponsiveSize(20)),
  },
  header: {
    backgroundColor: '#F87F16',
    marginBottom: verticalScale(getResponsiveSize(40)),
    paddingBottom: verticalScale(getResponsiveSize(10)),
    height: verticalScale(getResponsiveSize(170)),
    borderBottomLeftRadius: scale(getResponsiveSize(400)),
    borderBottomRightRadius: scale(getResponsiveSize(400)),
    transform: [{ scaleX: getHeaderTransform() }],
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    transform: [{ scaleX: getSearchTransform() }],
    paddingTop: verticalScale(getResponsiveSize(60)),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: width < 375 ? -25 : -30,
    paddingHorizontal: scale(getResponsiveSize(10)),
    zIndex: 1,
  },
  title: {
    fontSize: moderateScale(getResponsiveSize(25)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
  sectionTitle1: {
    fontSize: moderateScale(getResponsiveSize(15)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
  progressContainer: {
    marginTop: verticalScale(getResponsiveSize(5)),
  },
  progressText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(5)),
    includeFontPadding: false,
  },
  progressBar: {
    height: verticalScale(getResponsiveSize(6)),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: moderateScale(getResponsiveSize(3)),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(getResponsiveSize(3)),
  },
  questionContainer: {
    marginHorizontal: scale(getResponsiveSize(20)),
    borderRadius: moderateScale(getResponsiveSize(16)),
    padding: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(30)),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    lineHeight: moderateScale(getResponsiveSize(24)),
    marginBottom: verticalScale(getResponsiveSize(25)),
    includeFontPadding: false,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionsContainer: {
    marginBottom: verticalScale(getResponsiveSize(30)),
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(10)),
    padding: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(12)),
    borderWidth: 1,
    borderColor: '#1A3848',
    minHeight: verticalScale(getResponsiveSize(60)),
  },
  optionSelected: {
    backgroundColor: '#F87F16',
    borderColor: '#F87F16',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionCircle: {
    width: scale(getResponsiveSize(30)),
    height: scale(getResponsiveSize(30)),
    borderRadius: scale(getResponsiveSize(15)),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(getResponsiveSize(12)),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  correctOptionCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  optionId: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  optionIdSelected: {
    color: 'white',
  },
  correctOptionId: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    flex: 1,
    includeFontPadding: false,
  },
  optionTextSelected: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  correctOptionText: {
    color: '#FFFFFF',
  },
  // Explanation Section Styles
  explanationContainer: {
    borderRadius: moderateScale(getResponsiveSize(12)),
    padding: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(25)),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  sectionTitle: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginRight: scale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  exampleText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: '#1A3848',
    lineHeight: moderateScale(getResponsiveSize(22)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    includeFontPadding: false,
  },
  correctAnswerContainer: {
    backgroundColor: '#F0F9F0',
    borderRadius: moderateScale(getResponsiveSize(8)),
    padding: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  correctAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(5)),
  },
  correctAnswerText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#2E7D32',
    marginLeft: scale(getResponsiveSize(8)),
    includeFontPadding: false,
  },
  correctAnswerValue: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    marginLeft: scale(getResponsiveSize(26)),
    includeFontPadding: false,
  },
  audioButton: {
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(10)),
    paddingVertical: verticalScale(getResponsiveSize(15)),
    paddingHorizontal: scale(getResponsiveSize(20)),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(getResponsiveSize(50)),
  },
  audioButtonPressed: {
    backgroundColor: '#0F2A38',
  },
  audioButtonSpeaking: {
    backgroundColor: '#F87F16',
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIcon: {
    marginRight: scale(getResponsiveSize(12)),
  },
  audioText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(8)),
    paddingVertical: verticalScale(getResponsiveSize(12)),
    paddingHorizontal: scale(getResponsiveSize(25)),
    minWidth: scale(getResponsiveSize(120)),
    alignItems: 'center',
    minHeight: verticalScale(getResponsiveSize(45)),
  },
  navButtonPressed: {
    backgroundColor: '#F87F16',
  },
  navButtonText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  navButtonTextPressed: {
    color: '#FFFFFF',
  },
  // Loader Styles
  loaderContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderHeader: {
    paddingVertical: verticalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  loaderHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(40),
  },
  loaderBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderTitle: {
    fontSize: moderateScale(22),
    fontFamily: 'Poppins-Bold',
    color: 'white',
    includeFontPadding: false,
  },
  loaderContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(40),
  },
  loaderIconContainer: {
    marginBottom: verticalScale(30),
  },
  loaderIconCircle: {
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F87F16',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  loaderMainText: {
    fontSize: moderateScale(20),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    textAlign: 'center',
    marginBottom: verticalScale(10),
    includeFontPadding: false,
  },
  loaderSubText: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(30),
    includeFontPadding: false,
  },
  progressBarContainer: {
    width: '80%',
    height: verticalScale(6),
    backgroundColor: '#E0E0E0',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
    marginBottom: verticalScale(30),
  },
  loaderprogessbar: {
    height: '30%',
    backgroundColor: '#4CAF50',
    borderRadius: moderateScale(10),
    marginTop: verticalScale(15),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: moderateScale(18),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    textAlign: 'center',
    includeFontPadding: false,
  },
  errorButton: {
    backgroundColor: '#F87F16',
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
  },
  errorButtonText: {
    fontSize: moderateScale(16),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    includeFontPadding: false,
  },
  // Submit Overlay Styles
  submitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  submitTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    marginBottom: 20,
  },
  submitBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
  },
  submitBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  submitSubText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
});

export default Fornixqbank2;