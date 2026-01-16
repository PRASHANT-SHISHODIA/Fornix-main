import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

// 🔹 Scale functions
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 🔹 Responsive size function
const getResponsiveSize = (size) => {
  if (width < 375) return size * 0.85;
  if (width > 414) return size * 1.15;
  return size;
};

const Notes = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // 🔹 Load selected course and fetch notes
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load course data from AsyncStorage
        const courseData = await AsyncStorage.getItem('selectedCourse');
        if (courseData) {
          const parsed = JSON.parse(courseData);
          setCourseName(parsed.courseName || '');
          setSelectedCourseId(parsed.id);

          // Fetch notes for the course
          await fetchNotes(parsed.id);
        } else {
          Alert.alert('Error', 'No course selected');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load course data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔹 API call to fetch notes - FIXED VERSION
  const fetchNotes = async (courseId) => {
    setLoading(true);
    try {
      // Using axios with POST request and body
      const response = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/notes',
        {
          course_id: courseId || "cc613b33-3986-4d67-b33a-009b57a72dc8"
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setNotes(data.data || []);
      } else {
        Alert.alert('Error', 'Failed to fetch notes');
        setNotes([]);
      }
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', error.response?.data || error.message);

      // Try fallback with fetch if axios fails
      try {
        console.log('Trying fallback with fetch...');
        await fetchNotesWithFetch(courseId);
      } catch (fetchError) {
        Alert.alert('Error', 'Network error. Please try again.');
        setNotes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Alternative: Using fetch API
  const fetchNotesWithFetch = async (courseId) => {
    try {
      const response = await fetch('https://fornix-medical.vercel.app/api/v1/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotes(data.data || []);
      } else {
        throw new Error('API returned failure');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
    }
  };

  // 🔹 Refresh notes
  const handleRefresh = async () => {
    if (selectedCourseId) {
      await fetchNotes(selectedCourseId);
    } else {
      // If no course ID, use the hardcoded one for testing
      await fetchNotes("cc613b33-3986-4d67-b33a-009b57a72dc8");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle PDF open
  const handleOpenPDF = async (pdfUrl) => {
    try {
      if (!pdfUrl) {
        Alert.alert('Error', 'PDF URL not found');
        return;
      }

      const encodedUrl = encodeURI(pdfUrl);
      await Linking.openURL(encodedUrl);

    } catch (error) {
      Alert.alert(
        'PDF Error',
        'Unable to open PDF. Please install a PDF viewer.'
      );
    }
  };


  // Render each note item
  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleOpenPDF(item.pdf_url, item.title)}>
      <View style={styles.noteContent}>
        <View style={styles.noteIcon}>
          <Icon name="file-pdf" size={moderateScale(22)} color="#E53935" />
        </View>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.title || 'Untitled Note'}
          </Text>
          <Text style={styles.noteDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Icon name="external-link-alt" size={moderateScale(16)} color="#1A3848" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar  barStyle='dark-content'/>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon1
                name="arrow-back"
                size={moderateScale(28)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <Text style={styles.title}>Notes</Text>

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              disabled={loading}>
              <Icon1
                name="refresh"
                size={moderateScale(22)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Course Name */}
        {courseName ? (
          <View style={styles.courseContainer}>
            <Text style={styles.courseName}>{courseName}</Text>
            <Text style={styles.courseId}>
              Course ID: {selectedCourseId || 'Not available'}
            </Text>
          </View>
        ) : null}

        {/* Debug Info - Remove in production */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            API: https://fornix-medical.vercel.app/api/v1/notes
          </Text>
          <Text style={styles.debugText}>
            Method: POST with course_id in body
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F87F16" />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : notes.length > 0 ? (
          <View style={styles.notesContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalNotes}>
                Total Notes: {notes.length}
              </Text>
            </View>

            <FlatList
              data={notes}
              renderItem={renderNoteItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="sticky-note" size={moderateScale(60)} color="#CCCCCC" />
            <Text style={styles.emptyText}>No notes available</Text>
            <Text style={styles.emptySubText}>
              {selectedCourseId
                ? 'No notes found for this course'
                : 'Select a course to view notes'}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>
                {loading ? 'Loading...' : 'Retry'}
              </Text>
            </TouchableOpacity>

            {/* Test Button with hardcoded ID */}
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: '#1A3848', marginTop: 10 }]}
              onPress={() => fetchNotes("cc613b33-3986-4d67-b33a-009b57a72dc8")}>
              <Text style={styles.retryButtonText}>
                Test with Sample ID
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#F87F16',
    marginBottom: verticalScale(20),
    paddingBottom: verticalScale(10),
    height: verticalScale(150),
    borderBottomLeftRadius: scale(400),
    borderBottomRightRadius: scale(400),
    transform: [{ scaleX: width < 375 ? 1.5 : width > 414 ? 1.8 : 1.7 }],
  },
  searchContainer: {
    paddingHorizontal: scale(50),
    paddingVertical: verticalScale(20),
    transform: [{ scaleX: width < 375 ? 0.65 : width > 414 ? 0.55 : 0.58 }],
    paddingTop: verticalScale(50),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: scale(8),
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    includeFontPadding: false,
  },
  refreshButton: {
    padding: scale(8),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  courseContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
    alignItems: 'center',
  },
  courseName: {
    fontSize: moderateScale(18),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    textAlign: 'center',
    includeFontPadding: false,
    marginBottom: 5,
  },
  courseId: {
    fontSize: moderateScale(12),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    includeFontPadding: false,
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    fontSize: moderateScale(10),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    includeFontPadding: false,
  },
  notesContainer: {
    paddingHorizontal: scale(20),
  },
  totalContainer: {
    marginBottom: verticalScale(20),
  },
  totalNotes: {
    fontSize: moderateScale(16),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    textAlign: 'center',
    includeFontPadding: false,
  },
  listContainer: {
    paddingBottom: verticalScale(20),
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    marginRight: scale(12),
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginBottom: verticalScale(4),
    includeFontPadding: false,
  },
  noteDate: {
    fontSize: moderateScale(12),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    includeFontPadding: false,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.5,
  },
  loadingText: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: verticalScale(12),
    includeFontPadding: false,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    minHeight: height * 0.5,
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    includeFontPadding: false,
  },
  emptySubText: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    marginBottom: verticalScale(20),
    includeFontPadding: false,
  },
  retryButton: {
    backgroundColor: '#F87F16',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    includeFontPadding: false,
  },
});

export default Notes;