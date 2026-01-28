import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FlagSecure from 'react-native-flag-secure';


const { width, height } = Dimensions.get('window');

// 🔹 Scale functions (UI ke liye needed)
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const Notes = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // 🔹 Load course + notes
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  FlagSecure.activate(); // 🔒 enable security

  return () => {
    FlagSecure.deactivate(); // ❌ disable on leave
  };
}, []);


  const loadData = async () => {
  try {
    const courseData = await AsyncStorage.getItem('selectedCourse');

    console.log('Raw AsyncStorage:', courseData);

    if (!courseData) {
      Alert.alert('Error', 'No course selected');
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(courseData);

    console.log('Parsed Course:', parsed);

    // ✅ FIX HERE
    setCourseName(parsed.courseName || '');
    setSelectedCourseId(parsed.courseId); // ✅ correct key

    fetchNotes(parsed.courseId); // ✅ correct
  } catch (e) {
    console.log('LoadData Error:', e);
    Alert.alert('Error', 'Failed to load course data');
    setLoading(false);
  }
};

  const fetchNotes = async (
  courseId,
  subjectId = '',
  noteType = 'sample'
) => {
  if (!courseId) {
    console.log('❌ Course ID missing');
    setLoading(false);
    return;
  }

  console.log('📤 Notes API Body:', {
    course_id: courseId,
    subject_id: subjectId,
    note_type: noteType,
  });

  setLoading(true);
  try {
    const response = await axios.post(
      'https://fornix-medical.vercel.app/api/v1/notes',
      {
        course_id: courseId,
        subject_id: subjectId || '',
        note_type: noteType || 'sample',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📥 Notes API Response:', response.data);

    if (response.data?.success) {
      setNotes(response.data.data || []);
    } else {
      setNotes([]);
    }
  } catch (error) {
    console.log('❌ Notes API Error:', error?.response || error);
    Alert.alert('Error', 'Unable to fetch notes');
    setNotes([]);
  } finally {
    setLoading(false);
  }
};



  // 🔹 PDF open
  const handleOpenPDF = pdfUrl => {
    if (!pdfUrl) {
      Alert.alert('Error', 'PDF URL not found');
      return;
    }
    navigation.navigate('PdfViewer', { pdfUrl });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };


  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleOpenPDF(item.pdf_url)}
    >
      <View style={styles.noteContent}>
        <View style={styles.noteIcon}>
          <Icon name="file-pdf" size={moderateScale(22)} color="#E53935" />
        </View>

        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.title || 'Untitled Note'}
          </Text>

          <Text style={styles.noteDate}>
            {item.subject?.name || 'No Subject'} • {item.note_type}
          </Text>

          <Text style={styles.noteDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>

        <Icon
          name="external-link-alt"
          size={moderateScale(16)}
          color="#1A3848"
        />
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon1 name="arrow-back" size={moderateScale(28)} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Notes</Text>
            <TouchableOpacity
              onPress={() => fetchNotes(selectedCourseId)}
              disabled={loading}
              style={styles.refreshButton}>
              <Icon1 name="refresh" size={moderateScale(22)} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {courseName && (
          <View style={styles.courseContainer}>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F87F16" />
          </View>
        ) : notes.length > 0 ? (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item, index) => String(item.id ?? index)}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Notes;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  backButton: { padding: scale(8) },
  title: {
    fontSize: moderateScale(24),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    includeFontPadding: false,
  },
  refreshButton: { padding: scale(8) },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: verticalScale(20) },
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
  notesContainer: { paddingHorizontal: scale(20) },
  totalContainer: { marginBottom: verticalScale(20) },
  totalNotes: {
    fontSize: moderateScale(16),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    textAlign: 'center',
    includeFontPadding: false,
  },
  listContainer: { paddingBottom: verticalScale(20) },
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
  noteContent: { flexDirection: 'row', alignItems: 'center' },
  noteIcon: { marginRight: scale(12) },
  noteInfo: { flex: 1 },
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
