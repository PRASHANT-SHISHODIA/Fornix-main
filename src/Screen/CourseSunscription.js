import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* 🔹 Responsive helpers (OUTSIDE component) */
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const getResponsiveSize = size => {
  if (width < 375) return size * 0.85;
  if (width > 414) return size * 1.15;
  return size;
};

const getHeaderTransform = () => {
  if (width < 375) return 1.5;
  if (width > 414) return 1.7;
  return 1.6;
};

const getSearchTransform = () => {
  if (width < 375) return 0.65;
  if (width > 414) return 0.6;
  return 0.62;
};

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


const CourseSunscription = () => {
  const insets = useSafeAreaInsets();
  const navigation=useNavigation();

  const courseData = [
    {
      id: 1,
      title: 'NEET UG',
      duration: '1 Year',
      features: [
        'Live Classes with Experts',
        'Recorded Sessions',
        'Mock Tests & Analysis',
        'Study Material',
        'Certificate',
      ],
    },
    {
      id: 2,
      title: 'NEET PG',
      duration: '1 Year',
      features: [
        'Advanced Clinical Topics',
        'Live + Recorded Sessions',
        'Daily Practice Questions',
        'Mentor Support',
        'Certificate',
      ],
    },
  ];

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };


  // const onCoursePress = course => {
  //   navigation.navigate()
  

  //  }
  // };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#F87F16" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Choose Your Course</Text>
          </View>
        </View>
        <View>
          {courseData.map(item => {
            const scaleAnim = useRef(new Animated.Value(1)).current;
            const isExpanded = expandedId === item.id;

            return (
              <Animated.View
                key={item.id}
                style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
              >
                {/* Header */}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDuration}>⏱ {item.duration}</Text>

                {/* Features Preview / Expanded */}
                <View style={styles.featuresBox}>
                  {item.features
                    .slice(0, isExpanded ? item.features.length : 2)
                    .map((feature, index) => (
                      <Text key={index} style={styles.featureItem}>
                        ✔ {feature}
                      </Text>
                    ))}
                </View>

                {/* Expand Toggle */}
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expandText}>
                    {isExpanded ? 'Hide features ↑' : 'View all features ↓'}
                  </Text>
                </TouchableOpacity>

                {/* CTA */}
                <TouchableOpacity onPress={onCoursePress} style={styles.subscribeBtn}>
                  <Text style={styles.subscribeText}>Enroll Now </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseSunscription;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: verticalScale(getResponsiveSize(80)),
    paddingHorizontal: scale(getResponsiveSize(15)),
  },

  header: {
    backgroundColor: '#F87F16',
    height: verticalScale(getResponsiveSize(220)),
    borderBottomLeftRadius: scale(getResponsiveSize(400)),
    borderBottomRightRadius: scale(getResponsiveSize(400)),
    transform: [{ scaleX: getHeaderTransform() }],
    marginBottom: verticalScale(getResponsiveSize(20)),
  },

  headerContent: {
    paddingHorizontal: scale(getResponsiveSize(20)),
    transform: [{ scaleX: getSearchTransform() }],
    marginTop: verticalScale(getResponsiveSize(50)),
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: moderateScale(getResponsiveSize(24)),
    fontWeight: '700',
    color: '#fff',
  },

  courseBox: {
    padding: moderateScale(15),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(8),
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: verticalScale(10),
    // width:'200%',
    // height:'100%'
  },

  courseText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFDFB',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  cardTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#222',
    marginBottom: verticalScale(4),
  },

  cardDuration: {
    fontSize: moderateScale(13),
    color: '#777',
    marginBottom: verticalScale(10),
  },

  featuresBox: {
    marginBottom: verticalScale(6),
  },

  featureItem: {
    fontSize: moderateScale(13),
    color: '#444',
    marginBottom: verticalScale(6),
  },

  expandText: {
    fontSize: moderateScale(13),
    color: '#F87F16',
    fontWeight: '600',
    marginBottom: verticalScale(12),
  },

  subscribeBtn: {
    backgroundColor: '#F87F16',
    paddingVertical: verticalScale(12),
    borderRadius: 30,
    alignItems: 'center',
  },

  subscribeText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },




});
