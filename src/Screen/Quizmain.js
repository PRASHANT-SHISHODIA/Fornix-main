import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon1 from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Icon2 from 'react-native-vector-icons/FontAwesome';

// Screen width and height
const {width, height} = Dimensions.get('window');

// 🔹 Scale function to adjust UI for all screen sizes
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 🔹 Responsive size function based on screen width
const getResponsiveSize = (size) => {
  if (width < 375) { // Small phones
    return size * 0.85;
  } else if (width > 414) { // Large phones
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

const QuizMain = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // 🔹 Blinking button animation
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [blinkAnim]);

  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1A3848', '#F87F16'],
  });

  return (
    <View style={[styles.container, {paddingTop: insets.top,paddingBottom: insets.bottom}]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Header with Greeting, Image and Bell Icon */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              <Image
                source={{uri: 'https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg'}}
                style={styles.profileImage}
                
              />
            </View>

            {/* Greeting Container */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hey</Text>
              <Text style={styles.nameText}>Alex Buffet</Text>
            </View>

            {/* Bell Icon */}
            <TouchableOpacity style={styles.bellIconContainer}>
              <Icon2
                name="bell"
                size={moderateScale(getResponsiveSize(20))}
                color="white"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon1
                name="search"
                size={moderateScale(getResponsiveSize(23))}
                color="white"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Here"
                placeholderTextColor="white"
              />
            </View>
          </View>
        </View>

        {/* Start Quiz Button */}
        <View style={styles.startQuizContainer}>
          <Animated.View style={[styles.startQuizButton, {backgroundColor}]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Quizpage')} // Update with your actual quiz screen name
              activeOpacity={0.8}
              style={styles.startQuizTouchable}>
              <Text style={styles.startQuizText}>Start Quiz</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

      </ScrollView>
    </View>
  );
};

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
    height: verticalScale(getResponsiveSize(220)),
    borderBottomLeftRadius: scale(getResponsiveSize(400)),
    borderBottomRightRadius: scale(getResponsiveSize(400)),
    transform: [{scaleX: getHeaderTransform()}],
    justifyContent: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(getResponsiveSize(30)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    transform: [{scaleX: getSearchTransform()}],
  },
  profileImageContainer: {
    width: moderateScale(getResponsiveSize(45)),
    height: moderateScale(getResponsiveSize(45)),
    borderRadius: moderateScale(getResponsiveSize(10)),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    flex: 1,
    marginLeft: scale(getResponsiveSize(15)),
  },
  greetingText: {
    fontSize: moderateScale(getResponsiveSize(15)),
    fontFamily: 'Poppins-Regular',
    color: 'white',
    includeFontPadding: false,
  },
  nameText: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    includeFontPadding: false,
  },
  bellIconContainer: {
    width: moderateScale(getResponsiveSize(45)),
    height: moderateScale(getResponsiveSize(45)),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(getResponsiveSize(22.5)),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(30)),
    transform: [{scaleX: getSearchTransform()}],
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(25)),
    paddingHorizontal: scale(getResponsiveSize(15)),
    paddingVertical: verticalScale(getResponsiveSize(10)),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    
  },
  searchIcon: {
    marginRight: scale(getResponsiveSize(10)),
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: moderateScale(getResponsiveSize(14)),
    color: 'white',
    includeFontPadding: false,
  },
  startQuizContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(getResponsiveSize(100)),
  },
  startQuizButton: {
    borderRadius: moderateScale(getResponsiveSize(15)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    paddingHorizontal: scale(getResponsiveSize(60)),
    minWidth: scale(getResponsiveSize(200)),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startQuizTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startQuizText: {
    color: '#FFF',
    fontSize: moderateScale(getResponsiveSize(20)),
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default QuizMain;