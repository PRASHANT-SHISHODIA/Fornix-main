// Chapterwise.js
import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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

const Chapterwise = ({route}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [Chapter, setChapter] = useState([])
  const [loading, setLoading] = useState(true)
  // const route = useRoute();
  const { subjectId, subjectName } = route.params || {};
  const bookAnim = useRef(new Animated.Value(0)).current;
  const mood = route?.params?.mood ?? null;
  console.log("MODE RECEIVED IN CHAPTERWISE :", mood?.title);
  console.log("SUBJECT ID",subjectId);
  console.log("SUBJECT NAME",subjectName);


  // 🔹 Subject list from PDF with images
  const subjects = [
    { id: '1', title: 'Upper Limb', image: require('../assets/Images/Upperlimb.png') },
    { id: '2', title: 'General Anatomy', image: require('../assets/Images/Generalanatony.png') },
    { id: '3', title: 'Thorax', image: require('../assets/Images/Thorax.png') },
    { id: '4', title: 'Head & Neck', image: require('../assets/Images/Head&neck.png') },
    { id: '5', title: 'Neuroanatomy', image: require('../assets/Images/Neuroanatony.png') },
    { id: '6', title: 'Lower Limb', image: require('../assets/Images/Lowerlimb.png') },
  ];

  const getChapterBySubject = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!subjectId) {
        console.log("SubjectId Missing");
        return;
      }

      const responae = await axios.post('https://fornix-medical.vercel.app/api/v1/chapters',
        {
          subject_id: subjectId||"f36e020a-5ffb-4df9-976a-b289797d8627",
          mood: mood,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setChapter(responae.data?.data)
      console.log("API RESPONSE CHAPTER", responae.data.data)
    } catch (error) {
      console.log("CHAPTER API ERROR", error.responae.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  console.log(Chapter)

  useEffect(() => {
    getChapterBySubject();
  }, []);

  const limitwords = (text, maxWords = 15) => {
    if (!text) return '';
    const words = text.split('');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join('') + '...';
  };

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bookAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(bookAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, bookAnim]);

  const leftPageRotate = bookAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-25deg'],
  });

  const rightPageRotate = bookAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });


  const BookLoader = () => (
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
      <Text style={styles.loadingText}>Loading Chapters...</Text>
    </View>
  );


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
              <Text style={styles.title}>{subjectName}</Text>
            </View>
            <Text style={styles.sectionTitle}>Chapter Wise</Text>
          </View>
        </View>

        {/* 🔹 Subject Grid */}
        <View style={styles.featuresGrid}>
          {loading ? (
            <BookLoader />
          ) : (
            Chapter.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={styles.featureCard}
                onPress={() => {
                  if (mood) {
                    navigation.navigate('Selected', {
                      chapterId: sub.id,
                      ChapterName: sub.name,
                      mood: mood,
                    });
                  } else {
                    navigation.navigate('Selected', {
                      chapterId: sub.id,
                      ChapterName: sub.name,
                      // mood:mood,
                    });
                  }
                }

                }>
                <View style={styles.featureContent}>
                  <View style={styles.featureIconContainer}>
                    <Icon name="book-open" size={22} color="#1A3848" />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.featureTitle}>
                      {limitwords(sub.name, 15)}
                    </Text>
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
  sectionTitle: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: 'white',
    marginTop: verticalScale(getResponsiveSize(-20)),
    textAlign: 'center',
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
    elevation: 5,
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
    borderWidth: 3,
    borderColor: '#F87F16',
    marginLeft: scale(getResponsiveSize(-25)),
  },
  subjectImage: {
    width: scale(getResponsiveSize(56)),
    height: scale(getResponsiveSize(56)),
    borderRadius: moderateScale(getResponsiveSize(30)),
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
    textAlign: 'left',
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
    width: 70,
    height: 50,
    marginBottom: 12,
  },

  page: {
    width: 35,
    height: 50,
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
    fontSize: 13,
    color: '#1A3848',
    fontFamily: 'Poppins-Medium',
  },

});

export default Chapterwise;