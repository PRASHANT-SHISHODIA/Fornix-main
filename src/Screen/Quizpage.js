import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

// Enhanced responsive scaling functions
const scale = size => {
  const baseWidth = 375; // iPhone 6/7/8 width
  return (width / baseWidth) * size;
};

const verticalScale = size => {
  const baseHeight = 812; // iPhone X height
  return (height / baseHeight) * size;
};

const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Responsive font size function
const responsiveFontSize = (size) => {
  const scaleFactor = width / 375; // Base width iPhone 6/7/8
  const newSize = size * scaleFactor;
  
  if (width > 500) { // Tablet
    return Math.min(newSize, size * 1.2);
  }
  
  // For very small screens
  if (width < 350) {
    return Math.max(newSize, size * 0.8);
  }
  
  return newSize;
};

const Quizpage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionSelect = option => {
    setSelectedOption(option);
    Animated.spring(progressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Options data
  const options = [
    {id: 'A', text: 'Right atrium'},
    {id: 'B', text: 'Left atrium'},
    {id: 'C', text: 'Right ventricle'},
    {id: 'D', text: 'Left ventricle'},
  ];

  // Calculate dynamic padding and margins based on screen size
  const getDynamicPadding = () => {
    if (width < 350) return scale(12); // Very small phones
    if (width < 400) return scale(16); // Small phones
    return scale(20); // Normal and large phones
  };

  const getOptionPadding = () => {
    if (width < 350) return verticalScale(12);
    if (width < 400) return verticalScale(15);
    return verticalScale(18);
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar backgroundColor="#F87F16" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingHorizontal: getDynamicPadding()}
        ]}
        showsVerticalScrollIndicator={false}>
        
        {/* Question Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Questions {currentQuestion} of {totalQuestions}
          </Text>
        </View>

        {/* Timer Section */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Question Section */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {currentQuestion}. Which chamber of the heart receives oxygenated blood from the
            lungs?
          </Text>
        </View>

        {/* Options Section */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedOption === option.id && styles.optionSelected,
                {paddingVertical: getOptionPadding()}
              ]}
              onPress={() => handleOptionSelect(option.id)}
              activeOpacity={0.7}>
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionCircle,
                    selectedOption === option.id && styles.optionCircleSelected,
                  ]}>
                  <Text
                    style={[
                      styles.optionId,
                      selectedOption === option.id && styles.optionIdSelected,
                    ]}>
                    {option.id}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option.id && styles.optionTextSelected,
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit>
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={() => {
              /* Handle next question */
            }}
            activeOpacity={0.7}>
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F87F16',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  progressText: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Medium',
    color: 'white',
    includeFontPadding: false,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(25),
    marginTop: verticalScale(5),
  },
  timerText: {
    fontSize: responsiveFontSize(32),
    fontFamily: 'Poppins-Bold',
    color: 'white',
    includeFontPadding: false,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: verticalScale(25),
  },
  questionText: {
    fontSize: responsiveFontSize(18),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    lineHeight: moderateScale(24),
    includeFontPadding: false,
    textAlign: 'left',
  },
  optionsContainer: {
    marginBottom: verticalScale(20),
  },
  optionButton: {
    backgroundColor: 'transparent',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 2,
    borderColor: 'white',
    minHeight: verticalScale(55),
    justifyContent: 'center',
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#1A3848',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionCircle: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    borderWidth: 2,
    borderColor: 'white',
    minWidth: moderateScale(34),
  },
  optionCircleSelected: {
    backgroundColor: 'white',
  },
  optionId: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    includeFontPadding: false,
    textAlign: 'center',
  },
  optionIdSelected: {
    color: '#1A3848',
  },
  optionText: {
    flex: 1,
    fontSize: responsiveFontSize(15),
    fontFamily: 'Poppins-Medium',
    color: 'white',
    includeFontPadding: false,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  optionTextSelected: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(15),
    paddingHorizontal: scale(10),
  },
  navButton: {
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(10),
    minWidth: scale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'transparent',
    flex: 0.48,
    maxHeight: verticalScale(55),
  },
  nextButton: {
    backgroundColor: '#1A3848',
    borderColor: '#1A3848',
    
  },
  navButtonText: {
    fontSize: responsiveFontSize(15),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    includeFontPadding: false,
    textAlign: 'center',
    
  },
  nextButtonText: {
    color: 'white',
  },
});

export default Quizpage;