import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon1 from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

/* 🔹 Responsive helpers */
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const getResponsiveSize = size => {
  if (width < 375) return size * 0.85;
  if (width > 414) return size * 1.15;
  return size;
};




const CourseChoose = () => {
  const navigation = useNavigation();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      id: 1,
      name: 'NEET UG',
      description: 'Medical Entrance Exam',
      color: '#2C3E50',
      secondaryColor: '#3498DB',
    },
    {
      id: 2,
      name: 'NEET PG',
      description: 'Post Graduate Medical Exam',
      color: '#4A6491',
      secondaryColor: '#5DADE2',
    },
    {
      id: 3,
      name: 'AMC',
      description: 'Australian Medical Council',
      color: '#2980B9',
      secondaryColor: '#3498DB',
    },
    {
      id: 4,
      name: 'FMGE',
      description: 'Foreign Medical Graduate Exam',
      color: '#1A5276',
      secondaryColor: '#2C3E50',
    },
  ];

  const handleCourseSelect = async (course) => {
  try{
    setSelectedCourse(course.id);

    await AsyncStorage.setItem(
      'selectedCourse',
      JSON.stringify(course)
    );
    navigation.navigate('TabNavigation')
  } catch(error){
    Alert.alert("error", "course selection failed");
  }

  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🔶 Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Icon1 name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>

              <Text style={styles.title}>Select Your Program</Text>
            </View>
          </View>
        </View>

        {/* 🔶 Courses */}
        <View style={styles.coursesContainer}>
          <Text style={styles.sectionTitle}>Available Courses</Text>

          {courses.map(course => {
            const isSelected = selectedCourse === course.id;

            return (
              <TouchableOpacity
                key={course.id}
                activeOpacity={0.8}
                onPress={() => handleCourseSelect(course)}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor: course.color,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: '#FFF',
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.courseIcon}>
                    <Text style={styles.courseIconText}>
                      {course.name.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseDescription}>
                      {course.description}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIcon}>✓</Text>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.colorBar,
                    { backgroundColor: course.secondaryColor },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🔶 Selected Info */}
        {selectedCourse && (
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              Selected: {courses.find(c => c.id === selectedCourse)?.name}
            </Text>
            <Text style={styles.selectionHint}>
              You will be redirected to home screen
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseChoose;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: verticalScale(40),
  },

  /* 🔶 Header */
  header: {
    backgroundColor: '#F87F16',
    height: verticalScale(170),
    borderBottomLeftRadius: scale(400),
    borderBottomRightRadius: scale(400),
    transform: [{ scaleX: width < 375 ? 1.5 : width > 414 ? 1.8 : 1.7 }],
    marginBottom: verticalScale(30),
  },

  searchContainer: {
    paddingHorizontal: scale(50),
    paddingTop: verticalScale(60),
    transform: [{ scaleX: width < 375 ? 0.65 : width > 414 ? 0.55 : 0.58 }],
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButton: {
    position: 'absolute',
    left: -30,
  },

  title: {
    fontSize: moderateScale(24),
    color: '#FFF',
    fontWeight: '600',
  },

  coursesContainer: {
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F3A4D',
    marginBottom: 20,
    textAlign: 'center',
  },

  courseCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
  },

  cardContent: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFB703',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  courseIconText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  courseInfo: {
    flex: 1,
  },

  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },

  courseDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },

  selectedIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF8A00',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  colorBar: {
    height: 5,
    width: '100%',
  },

  selectionInfo: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8A00',
  },

  selectionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F3A4D',
  },

  selectionHint: {
    fontSize: 13,
    color: '#6B7280',
  },
});
