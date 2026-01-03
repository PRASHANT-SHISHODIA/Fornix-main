// AIscreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon1 from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

// Screen dimensions
const {width, height} = Dimensions.get('window');

// 🔹 Responsive scaling functions
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

const AIscreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const features = [
    {
      id: '1',
      title: 'Premium Plan',
      icon: 'crown',
      onPress: () => navigation.navigate('PremiumPlan'),
    },
    {
      id: '2',
      title: 'CCD Podcast',
      icon: 'podcast',
      onPress: () => navigation.navigate('CCDPodcast'),
    },
    {
      id: '3',
      title: 'VIVA',
      icon: 'microphone',
      onPress: () => navigation.navigate('VIVA'),
    },
    {
      id: '4',
      title: 'KBC',
      icon: 'question-circle',
      onPress: () => navigation.navigate('KBC'),
    },
    {
      id: '5',
      title: 'Smart Tracking',
      icon: 'chart-line',
      onPress: () => navigation.navigate('SmartTracking'),
    },
    {
      id: '6',
      title: 'T & D',
      icon: 'book',
      onPress: () => navigation.navigate('TrainingDevelopment'),
    },
  ];

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header with Curved Background */}
        <View style={styles.header}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon1
                name="search"
                size={moderateScale(getResponsiveSize(20))}
                color="white"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="white"
              />
            </View>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map(feature => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={feature.onPress}>
              <View style={styles.featureContent}>
                <View style={styles.featureIconContainer}>
                  <Icon
                    name={feature.icon}
                    size={moderateScale(getResponsiveSize(22))}
                    color="#1A3848"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Optional Note Section */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Explore AI-powered tools designed to make your learning more
            interactive and effective.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
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
    marginBottom: verticalScale(getResponsiveSize(30)),
    paddingBottom: verticalScale(getResponsiveSize(30)),
    borderBottomLeftRadius: scale(getResponsiveSize(400)),
    borderBottomRightRadius: scale(getResponsiveSize(400)),
    height: verticalScale(getResponsiveSize(170)),
    transform: [{scaleX: getHeaderTransform()}],
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    transform: [{scaleX: getSearchTransform()}],
    paddingTop: verticalScale(getResponsiveSize(40)),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(22)),
    paddingHorizontal: scale(getResponsiveSize(15)),
    paddingVertical: verticalScale(getResponsiveSize(5)),
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
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginTop: '12%',
    includeFontPadding: false,
    textAlign: 'center',
  },
  noteContainer: {
    marginTop: verticalScale(getResponsiveSize(65)),
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  noteText: {
    fontSize: moderateScale(getResponsiveSize(10)),
    fontFamily: 'Poppins-Regular',
    color: '#1A3848',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(10)),
    includeFontPadding: false,
    lineHeight: moderateScale(getResponsiveSize(16)),
  },
});

export default AIscreen;