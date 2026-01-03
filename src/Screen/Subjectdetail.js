// QBankSubjectPage.js
import React, {useRef, useEffect} from 'react';
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

// 🔹 Responsive scaling
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

const Subjectdetail = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // 🔹 Subject list (with navigation routes)
  const subjects = [
    {id: '1', title: 'Chapter Wise', route: 'Chapterwise'},
    {id: '2', title: 'Topic Wise', route: 'Topicwise'},
    {id: '3', title: 'Integration', route: 'Topiclist',
      fullWidth: true,
    },
  ];

  // 🔹 Assign icons based on subject title
  const getIconName = title => {
    switch (title) {
      case 'Chapter Wise':
        return 'book-open'; // Icon for chapters
      case 'Topic Wise':
        return 'tasks'; // Icon for topics
      case 'Integration':
        return 'project-diagram'; // Icon for integration
      default:
        return 'folder'; // Fallback icon
    }
  };

  // 🔹 Blink animation for upgrade button
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
              <Text style={styles.title}>Anatomy</Text>
            </View>
          </View>
        </View>

        {/* 🔹 Subject Grid */}
        <View style={styles.featuresGrid}>
          {subjects.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.featureCard,sub.fullWidth && styles.integrationCard,]}
              onPress={() => navigation.navigate(sub.route, {subject: sub.title})}>
              <View style={styles.featureContent}>
                <View style={styles.featureIconContainer}>
                  <Icon
                    name={getIconName(sub.title)}
                    size={moderateScale(getResponsiveSize(22))}
                    color="#1A3848"
                  />
                </View>
                <View style={[styles.textContainer,sub.title==="Integration"&& styles.integrationContent]}>
                  <Text style={[styles.featureTitle, sub.title ==='Integration' && styles.integrationText]}>{sub.title}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    transform: [{scaleX: getHeaderTransform()}],
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    transform: [{scaleX: getSearchTransform()}],
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(30)),
  },
  featureCard: {
    width: (width - scale(getResponsiveSize(60))) / 2,
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(16)),
    paddingHorizontal: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    paddingVertical: verticalScale(getResponsiveSize(10)),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: verticalScale(getResponsiveSize(80)),
  },
  featureContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  featureIconContainer: {
    width: scale(getResponsiveSize(60)),
    height: scale(getResponsiveSize(60)),
    borderRadius: scale(getResponsiveSize(60)),
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F87F16',
    marginLeft: scale(getResponsiveSize(-25)),
  },
  textContainer: {
    flex: 1,
    marginLeft: scale(getResponsiveSize(10)),
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: moderateScale(getResponsiveSize(13)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginTop: '12%',
    includeFontPadding: false,
    textAlign: 'center',
  },
  subText: {
    fontSize: moderateScale(getResponsiveSize(10)),
    color: '#C7D1D9',
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  upgradeButton: {
    alignSelf: 'center',
    borderRadius: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(12)),
    paddingHorizontal: scale(getResponsiveSize(40)),
    marginBottom: verticalScale(getResponsiveSize(30)),
  },
  upgradeText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: moderateScale(getResponsiveSize(14)),
    textAlign: 'center',
    includeFontPadding: false,
  },
  integrationCard: {
  width: '100%',        // 👈 Full width
  alignSelf: 'center',
},
integrationContent: {
  flexDirection: 'column',   // 👈 row se column
  justifyContent: 'center',
  alignItems: 'center',      // 👈 horizontal + vertical center
},

integrationText: {
  fontSize: moderateScale(getResponsiveSize(20)),
  marginTop: 0,
  textAlign: 'center',
},


});

export default Subjectdetail;