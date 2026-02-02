// QBankSubjectPage.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Animated,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import Course from './Course';

// Screen dimensions
const { width, height } = Dimensions.get('window');

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

const Qbanksubject = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [subject, setSubject] = useState([]);
  const [loading, setLoading] = useState(true);
  const bookAnim = useRef(new Animated.Value(0)).current;
  const route = useRoute();
  const mood = route?.params?.mood ?? null;
  console.log('MOOD RECEVID IN QBANKSSUBJECT :', mood?.title)
  const [selectedCourse, setSelectedCourse] = useState(null);
  // const blinkAnim = useRef(new Animated.Value(0)).current;
  console.log("COURSE IN THE", selectedCourse)


  // 🔹 Subject list (with navigation routes)
  const subjects = [
    { id: '1', title: 'Anatomy', icon: 'user-md', route: 'Subjectdetail' },
    { id: '2', title: 'Biochemistry', icon: 'flask', route: 'BiochemistryScreen' },
    { id: '3', title: 'Microbiology', icon: 'microscope', route: 'MicrobiologyScreen' },
    { id: '4', title: 'Physiology', icon: 'heartbeat', route: 'PhysiologyScreen' },
    { id: '5', title: 'Pathology', icon: 'vials', route: 'PathologyScreen' },
    { id: '6', title: 'Pharmacology', icon: 'pills', route: 'PharmacologyScreen' },
  ];

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseData = await AsyncStorage.getItem('selectedCourse');
        if (courseData) {
          const parsed = JSON.parse(courseData);
          setSelectedCourse(parsed);
          console.log('COURSE FROM STORAGE 👉', parsed);
        }
      } catch (e) {
        console.log('ERROR LOADING COURSE', e);
      }
    };

    loadCourse();
  }, []);

  const isAMC = selectedCourse?.courseName?.toUpperCase().includes('AMC');
  console.log('IS AMC COURSE:', isAMC);


  // 🔹 Blink animation for upgrade button
  const blinkAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bookAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bookAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, bookAnim]);
  const leftPageRotate = bookAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-30deg'],
  });

  const rightPageRotate = bookAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '30deg'],
  });



  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1A3848', '#F87F16'],
  });


  const getSubjectsByCourse = async (courseId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/subjects',
        {
          course_id: courseId, // ✅ dynamic
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSubject(response.data.data || []);
    } catch (error) {
      console.log(
        'SUBJECT API ERROR',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  console.log("Subject responae ", subject)

  // useEffect(() => {
  //   getSubjectsByCourse();
  // }, []);
  useEffect(() => {
    if (selectedCourse?.courseId) {
      getSubjectsByCourse(selectedCourse.courseId);
    }
  }, [selectedCourse]);


  const BookLoader = () => {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.book}>
          <Animated.View
            style={[
              styles.page,
              { transform: [{ rotateY: leftPageRotate }] },
            ]}
          />
          <Animated.View
            style={[
              styles.page,
              styles.rightPage,
              { transform: [{ rotateY: rightPageRotate }] },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading Subjects...</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
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
              <Text style={styles.title}>Q Bank</Text>
            </View>
          </View>
        </View>

        {/* 🔹 Subject Grid */}
        <View style={styles.featuresGrid}>
          {loading ? (
            <BookLoader />
          ) : (
            subject?.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={styles.featureCard}
                onPress={() => {
                  if (isAMC) {
                    // 🔹 AMC → Mood flow
                    navigation.navigate('Mood', {
                      subjectId: sub.id,
                      subjectName: sub.name,
                      Course: selectedCourse,
                      from: 'qBankSubject',
                    });
                  } else {
                    // 🔹 All other courses → QBank flow
                    navigation.navigate('Chapterwise', {
                      subjectId: sub.id,
                      subjectName: sub.name,
                      Course: selectedCourse,
                    });
                  }
                }}

              >
                <View style={styles.featureContent}>
                  <View style={styles.featureIconContainer}>
                    {sub.icon_url ? (
                      <Image
                        source={{ uri: sub.icon_url }}
                        style={styles.subjectIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon name="book" size={22} color="#1A3848" />
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.featureTitle}>{sub.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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
    shadowOffset: { width: 0, height: 2 },
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
  loaderContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(40),
  },

  book: {
    flexDirection: 'row',
    width: 80,
    height: 60,
    marginBottom: 15,
  },

  page: {
    width: 40,
    height: 60,
    backgroundColor: '#F87F16',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },

  rightPage: {
    backgroundColor: '#1A3848',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },

  loadingText: {
    fontSize: 14,
    color: '#1A3848',
    fontFamily: 'Poppins-Medium',
  },
  subjectIcon: {
  width: scale(getResponsiveSize(35)),
  height: scale(getResponsiveSize(35)),
},


});

export default Qbanksubject;