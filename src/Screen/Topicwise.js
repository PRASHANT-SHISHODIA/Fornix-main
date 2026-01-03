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
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Selected from './Selected';
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

const Topicwise = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { chapterId,mood } = route.params || {};
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState([]);
  const Difficult = mood?.title ?? null;
  console.log('MOOD IN TOPIC LIST :', Difficult)
  

  console.log("id", chapterId)
  // 🔹 Topic data from PDF
  // const [topic, setTopic] = useState([
  //   { id: 1, title: 'Bones of Upper Limb', completed: true },
  //   { id: 2, title: 'Brachial Plexus & Its lesions', completed: true },
  //   { id: 3, title: 'Muscles of Scapular Region', completed: false },
  //   { id: 4, title: 'Rotator Cuff', completed: true },
  //   { id: 5, title: 'Intermuscular Spaces', completed: true },
  //   { id: 6, title: 'Anatomical Snuff Box', completed: false },

  // ]);

  const getTopicsByChapter = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://fornix-medical.vercel.app/api/v1/chapter-topics",
        {
          chapter_id: "e64a6925-719e-4f4e-b03d-1c69c3f4fe92",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response?.data?.data) {
        setTopics(response?.data?.data);
        console.log("respons of Topic ", response?.data?.data)
      }
    } catch (error) {
      console.log("TOPIC API ERROR :", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }

  };
  useEffect(() => {
    // if (chapterId) {
    //   getTopicsByChapter();
    // }
    getTopicsByChapter();
  }, [chapterId]);
  console.log("Topic list:", topics)




  // 🔹 Blink animation for start quiz button
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

  const toggleTopic = (item) => {
    setSelectedTopic(prev => {
      const alreadySelected = prev.find(t => t.id === item.id);
      if (alreadySelected) {
        return prev.filter(t => t.id !== item.id);
      } else {
        return [...prev, item];
      }
    }
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
              <Text style={styles.title}>Anatomy</Text>

            </View>
            <Text style={styles.sectionTitle1}>Topic Wise</Text>
          </View>
        </View>


        {/* 🔹 Topic Wise Section */}
        <View style={styles.sectionContainer}>


          {/* 🔹 Topics List */}
          {/* <View style={styles.topicsContainer}>
            {topics.map(topic => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicItem}
                onPress={() => toggleTopicCompletion(topic.id)}>
                <View style={styles.topicLeft}>
                  <View style={[
                    styles.checkbox,
                    topic.completed && styles.checkboxCompleted
                  ]}>
                    {topic.completed && (
                      <Icon name="check" size={moderateScale(getResponsiveSize(12))} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[
                    styles.topicText,
                    topic.completed && styles.topicTextCompleted
                  ]}>
                    {topic.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View> */}

          {topics.map(item => {
            const isSelected = selectedTopic.some(t => t.id === item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.topicItem}
                onPress={() => toggleTopic(item)}
              >
                <View style={styles.topicLeft}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxCompleted,
                    ]}
                  >
                    {isSelected && (
                      <Icon name="check" size={12} color="#fff" />
                    )}
                  </View>

                  <Text style={styles.topicText}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}


          {/* 🔹 Buttons Container */}
          <View style={styles.buttonsContainer}>
            {/* 🔹 Start Quiz Button */}
            <Animated.View style={[styles.startQuizButton, { backgroundColor }]}>
              <TouchableOpacity
                style={styles.quizButton}
                onPress={() => {
                  if (selectedTopic.length === 0) {
                    Alert.alert("Please select a topic");
                    return;
                  }

                 if(mood){
                   navigation.navigate('Fornixqbank2', {
                    mode: 'topic',
                    topicId: selectedTopic.map(t => t.id),
                    Difficult:mood
                  });
                 }else{
                   navigation.navigate('Fornixqbank2', {
                    mode: 'topic',
                    topicId: selectedTopic.map(t => t.id)
                  });
                 }
                }}
              >

                <Text style={styles.quizButtonText}>Start Quiz</Text>
                <Icon name="arrow-right" size={moderateScale(getResponsiveSize(16))} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            {/* 🔹 Home Button */}
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('TabNavigation')} // Update with your actual home screen name
            >
              <Icon name="home" size={moderateScale(getResponsiveSize(18))} color="white" />
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: moderateScale(getResponsiveSize(25)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(25)),
    includeFontPadding: false,
  },
  sectionContainer: {
    marginHorizontal: scale(getResponsiveSize(20)),
    borderRadius: moderateScale(getResponsiveSize(16)),
    padding: scale(getResponsiveSize(20)),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    marginBottom: verticalScale(getResponsiveSize(30)),
  },
  sectionTitle1: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginTop: verticalScale(getResponsiveSize(-20)),
    includeFontPadding: false,
  },
  topicsContainer: {
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(getResponsiveSize(12)),
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: scale(getResponsiveSize(20)),
    height: scale(getResponsiveSize(20)),
    borderRadius: scale(getResponsiveSize(4)),
    borderWidth: 2,
    borderColor: '#1A3848',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(getResponsiveSize(12)),
  },
  checkboxCompleted: {
    backgroundColor: '#1A3848',
    borderColor: '#1A3848',
  },
  topicText: {
    fontSize: moderateScale(getResponsiveSize(17)),
    fontFamily: 'Poppins-Regular',
    color: '#1A3848',
    flex: 1,
    includeFontPadding: false,
  },
  topicTextCompleted: {
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
  },
  buttonsContainer: {
    marginTop: verticalScale(getResponsiveSize(30)),
  },
  startQuizButton: {
    borderRadius: moderateScale(getResponsiveSize(10)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    paddingHorizontal: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  quizButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizButtonText: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginRight: scale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
  homeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(getResponsiveSize(10)),
    paddingVertical: verticalScale(getResponsiveSize(15)),
    paddingHorizontal: scale(getResponsiveSize(20)),
    borderWidth: 2,
    borderColor: '#1A3848',
    backgroundColor: "#1A3848"
  },
  homeButtonText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginLeft: scale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
});

export default Topicwise;