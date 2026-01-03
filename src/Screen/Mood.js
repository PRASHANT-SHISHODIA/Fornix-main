// Mood.js
import React, {useRef, useEffect, useState} from 'react';
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
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

// Screen dimensions
const {width, height} = Dimensions.get('window');

// 🔹 Responsive scaling functions
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 🔹 Responsive font size based on screen width
const responsiveFontSize = (size) => {
  const scaleFactor = width / 375; // Base width 375 (iPhone 6/7/8)
  const scaledSize = size * scaleFactor;
  return Math.max(scaledSize, size * 0.8); // Minimum 80% of original size
};

// 🔹 Get responsive padding and margins
const getResponsiveSize = (size) => {
  if (width < 375) { // Small phones
    return size * 0.85;
  } else if (width > 414) { // Large phones
    return size * 1.1;
  }
  return size; // Normal phones
};

const Mood = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [selectedMood, setSelectedMood] = useState(null);

  // 🔹 Mood options
  const moodOptions = [
    {id: '1', title: 'Competitive', icon: 'trophy'},
    {id: '2', title: 'Funny / Easy', icon: 'laugh-beam'},
    {id: '3', title: 'Moderate', icon: 'balance-scale'},
    {id: '4', title: 'Difficult', icon: 'fire'},
  ];

  // 🔹 Blink animation for start button
  const blinkAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [blinkAnim]);

  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1A3848', '#F87F16'],
  });

  // 🔹 Handle mood selection with toggle functionality
  const handleMoodSelect = (moodId) => {
    if (selectedMood === moodId) {
      // If the same mood is clicked again, deselect it
      setSelectedMood(null);
    } else {
      // Select the new mood
      setSelectedMood(moodId);
    }
  };


  // 🔹 Get background color for mood card
  const getMoodCardColor = (moodId) => {
    return selectedMood === moodId ? '#F87F16' : '#1A3848';
  };

  // 🔹 Get icon background color
  const getIconBackgroundColor = (moodId) => {
    return selectedMood === moodId ? '#FFFFFF' : '#F0F4F8';
  };

  // 🔹 Get icon color
  const getIconColor = (moodId) => {
    return selectedMood === moodId ? '#F87F16' : '#1A3848';
  };

  const selectedMoodObj = moodOptions.find(
    m => m.id === selectedMood
  );

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}>
                <Icon1
                  name="arrow-back"
                  size={moderateScale(getResponsiveSize(28))}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.title}>Mood</Text>
            </View>
          </View>
        </View>

        {/* 🔹 Mood Options Grid */}
        <View style={styles.moodGrid}>
          {moodOptions.map(mood => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodCard,
                { backgroundColor: getMoodCardColor(mood.id) }
              ]}
              onPress={() => handleMoodSelect(mood.id)}>
              <View style={styles.moodContent}>
                <View style={[
                  styles.moodIconContainer,
                  { backgroundColor: getIconBackgroundColor(mood.id) }
                ]}>
                  <Icon
                    name={mood.icon}
                    size={moderateScale(getResponsiveSize(24))}
                    color={getIconColor(mood.id)}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.moodTitle}>{mood.title}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔹 Divider */}
        <View style={styles.divider} />

        {/* 🔹 Start Quiz Button */}
        <Animated.View style={[styles.startButton, {backgroundColor}]}>
          <TouchableOpacity
            style={styles.startButtonTouchable}
            onPress={() => {
              if (selectedMood) {
                console.log('Start Quiz with mood:', moodOptions.find(m => m.id === selectedMood)?.title);
                // Navigate to quiz screen with selected mood
                navigation.navigate('Qbanksubject', { mood: selectedMoodObj });
              } else {
                console.log('Please select a mood first');
                // You can show an alert here if needed
              }
            }}>
            <Text style={styles.startButtonText}>
              {selectedMood ? 'Start Quiz' : 'Select a Mood to Start'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// 🔹 Styles
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
    transform: [{scaleX: width < 375 ? 1.5 : width > 414 ? 1.8 : 1.7}],
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    transform: [{scaleX: width < 375 ? 0.65 : width > 414 ? 0.55 : 0.58}],
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
    fontSize: moderateScale(getResponsiveSize(24)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(25)),
    includeFontPadding: false,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(30)),
  },
  moodCard: {
    width: (width - scale(getResponsiveSize(60))) / 2,
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(16)),
    paddingHorizontal: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    paddingVertical: verticalScale(getResponsiveSize(15)),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: verticalScale(getResponsiveSize(80)),
  },
  moodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodIconContainer: {
    width: scale(getResponsiveSize(55)),
    height: scale(getResponsiveSize(55)),
    borderRadius: scale(getResponsiveSize(29)),
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F87F16',
    marginLeft: scale(getResponsiveSize(-28)),
  },
  textContainer: {
    flex: 1,
    marginLeft: scale(getResponsiveSize(10)),
    justifyContent: 'center',
  },
  moodTitle: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: scale(getResponsiveSize(20)),
    marginVertical: verticalScale(getResponsiveSize(20)),
  },
  startButton: {
    alignSelf: 'center',
    borderRadius: moderateScale(getResponsiveSize(10)),
    marginVertical: verticalScale(getResponsiveSize(100)),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: scale(getResponsiveSize(200)),
  },
  startButtonTouchable: {
    paddingVertical: verticalScale(getResponsiveSize(25)),
    paddingHorizontal: scale(getResponsiveSize(80)),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: moderateScale(getResponsiveSize(16)),
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default Mood;