import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

// Responsive functions (same as before)
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const getResponsiveSize = (size) => {
  if (width < 375) return size * 0.85;
  if (width > 414) return size * 1.1;
  return size;
};

const TestAndDiscussion = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseId, setCourseId] = useState(null);

  // const courseId = "cc613b33-3986-4d67-b33a-009b57a72dc8";
  const API_URL = "https://fornix-medical.vercel.app/api/v1/mobile/discussions";

  useEffect(() => {
    if (courseId) {
      fetchDiscussions(courseId);
    }
  }, [courseId]);


  useEffect(() => {
    loadSelectedCourse();
  }, []);

  const loadSelectedCourse = async () => {
    try {
      const raw = await AsyncStorage.getItem('selectedCourse');

      if (!raw) {
        console.log('❌ No course found in storage');
        return;
      }

      const parsed = JSON.parse(raw);

      console.log('✅ Selected Course from storage:', parsed);

      setCourseId(parsed.courseId); // 👈 IMPORTANT
    } catch (e) {
      console.log('Course load error:', e);
    }
  };


  // const fetchDiscussions = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const requestBody = { course_id: courseId };
  //     const response = await axios.post(API_URL, requestBody, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       }
  //     });

  //     if (response.data.success) {
  //       setDiscussions(response.data.data || []);
  //     } else {
  //       setError('Failed to fetch discussions');
  //     }
  //   } catch (err) {
  //     console.error('API Error:', err);
  //     setError('Network error. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchDiscussions = async (cid) => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const requestBody = { course_id: cid };

  //     const response = await axios.post(API_URL, requestBody, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     });

  //     if (response.data.success) {
  //       setDiscussions(response.data.data || []);
  //     } else {
  //       setError('Failed to fetch discussions');
  //     }
  //   } catch (err) {
  //     console.log('API Error:', err);
  //     setError('Network error. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchDiscussions = async (cid) => {
    if (!cid || typeof cid !== 'string') {
      console.log('❌ Invalid courseId:', cid);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Sending course_id:', cid);

      const response = await axios.post(API_URL, {
        course_id: cid,
      });

      if (response.data.success) {
        setDiscussions(response.data.data || []);
      } else {
        setError('Failed to fetch discussions');
      }
    } catch (err) {
      console.log('❌ API Error:', err?.response?.data || err.message);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // 🔹 **YAHAN PAR NAVIGATION HANDLER HAI**
  const handleDiscussionPress = (discussion) => {
    // Discussion ke saare details ko next screen par bhej rahe hain
    navigation.navigate('DiscussionDetails', {
      discussionId: discussion.id,
      discussionTitle: discussion.title,
      discussionDescription: discussion.description,
      subjectName: discussion.subjects?.name,
      courseName: discussion.courses?.name,
      doctors: discussion.discussion_doctors,
      createdAt: discussion.created_at,
      // Optional: Poori discussion object bhi bhej sakte hain
      fullDiscussion: discussion
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const renderDoctors = (doctors) => {
    if (!doctors || doctors.length === 0) {
      return (
        <View style={styles.doctorItem}>
          <Text style={styles.noDoctorText}>No doctors assigned</Text>
        </View>
      );
    }

    return doctors.slice(0, 3).map((item, index) => (
      <View key={`${item.doctor_id}-${index}`} style={styles.doctorItem}>
        <Icon name="user-md" size={moderateScale(getResponsiveSize(14))} color="#F87F16" />
        <Text style={styles.doctorName}>
          {item.doctors?.full_name || 'Unknown Doctor'}
        </Text>
      </View>
    ));
  };

  // Loading, Error, Empty states (same as before)
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#F87F16" />
        <Text style={styles.loadingText}>Loading Discussions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
        <Icon name="exclamation-triangle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDiscussions}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (discussions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
        <Icon name="comments" size={50} color="#1A3848" />
        <Text style={styles.emptyText}>No discussions found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDiscussions}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
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
              <Text style={styles.title}>Discussions</Text>
            </View>
          </View>
        </View>

        {/* Discussion Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {discussions.length} Discussion{discussions.length !== 1 ? 's' : ''} Found
          </Text>
        </View>

        {/* Discussions List */}
        <View style={styles.discussionsContainer}>
          {discussions.map((discussion) => (
            <TouchableOpacity
              key={discussion.id}
              style={styles.discussionCard}
              onPress={() => handleDiscussionPress(discussion)}
              activeOpacity={0.7}>

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>
                    {discussion.subjects?.name || 'No Subject'}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {formatDate(discussion.created_at)}
                </Text>
              </View>

              {/* Discussion Title */}
              <Text style={styles.discussionTitle} numberOfLines={2}>
                {discussion.title}
              </Text>

              {/* Discussion Description */}
              <Text style={styles.discussionDescription} numberOfLines={3}>
                {discussion.description}
              </Text>

              {/* Course Info */}
              <View style={styles.courseInfo}>
                <Icon name="book" size={moderateScale(getResponsiveSize(14))} color="#1A3848" />
                <Text style={styles.courseText}>
                  {discussion.courses?.name || 'No Course'}
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Doctors Section */}
              <View style={styles.doctorsSection}>
                <View style={styles.doctorsHeader}>
                  <Icon name="user-friends" size={moderateScale(getResponsiveSize(16))} color="#F87F16" />
                  <Text style={styles.doctorsTitle}>Doctors:</Text>
                </View>
                <View style={styles.doctorsList}>
                  {renderDoctors(discussion.discussion_doctors)}
                  {discussion.discussion_doctors?.length > 3 && (
                    <View style={styles.moreDoctors}>
                      <Text style={styles.moreDoctorsText}>
                        +{discussion.discussion_doctors.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* View Details Button */}
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => handleDiscussionPress(discussion)}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Icon name="arrow-right" size={moderateScale(getResponsiveSize(12))} color="#FFFFFF" />
              </TouchableOpacity>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  loadingText: {
    marginTop: verticalScale(getResponsiveSize(20)),
    fontSize: moderateScale(getResponsiveSize(16)),
    color: '#1A3848',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    marginTop: verticalScale(getResponsiveSize(20)),
    fontSize: moderateScale(getResponsiveSize(16)),
    color: '#FF6B6B',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginHorizontal: scale(getResponsiveSize(20)),
  },
  emptyText: {
    marginTop: verticalScale(getResponsiveSize(20)),
    fontSize: moderateScale(getResponsiveSize(16)),
    color: '#1A3848',
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    marginTop: verticalScale(getResponsiveSize(20)),
    backgroundColor: '#F87F16',
    paddingVertical: verticalScale(getResponsiveSize(12)),
    paddingHorizontal: scale(getResponsiveSize(30)),
    borderRadius: moderateScale(getResponsiveSize(8)),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
  },
  header: {
    backgroundColor: '#F87F16',
    marginBottom: verticalScale(getResponsiveSize(40)),
    paddingBottom: verticalScale(getResponsiveSize(10)),
    height: verticalScale(getResponsiveSize(170)),
    borderBottomLeftRadius: scale(getResponsiveSize(400)),
    borderBottomRightRadius: scale(getResponsiveSize(400)),
    transform: [{ scaleX: width < 375 ? 1.5 : width > 414 ? 1.8 : 1.7 }],
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    transform: [{ scaleX: width < 375 ? 0.65 : width > 414 ? 0.55 : 0.58 }],
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
  countContainer: {
    paddingHorizontal: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  countText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
  },
  discussionsContainer: {
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  discussionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(getResponsiveSize(12)),
    padding: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(15)),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  subjectBadge: {
    backgroundColor: '#1A3848',
    paddingHorizontal: scale(getResponsiveSize(12)),
    paddingVertical: verticalScale(getResponsiveSize(6)),
    borderRadius: moderateScale(getResponsiveSize(20)),
  },
  subjectText: {
    color: '#FFFFFF',
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-SemiBold',
  },
  dateText: {
    color: '#666666',
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
  },
  discussionTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginBottom: verticalScale(getResponsiveSize(10)),
  },
  discussionDescription: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    marginBottom: verticalScale(getResponsiveSize(15)),
    lineHeight: moderateScale(getResponsiveSize(20)),
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  courseText: {
    marginLeft: scale(getResponsiveSize(8)),
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#1A3848',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: verticalScale(getResponsiveSize(15)),
  },
  doctorsSection: {
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  doctorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(10)),
  },
  doctorsTitle: {
    marginLeft: scale(getResponsiveSize(8)),
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
  },
  doctorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingHorizontal: scale(getResponsiveSize(12)),
    paddingVertical: verticalScale(getResponsiveSize(6)),
    borderRadius: moderateScale(getResponsiveSize(20)),
    marginRight: scale(getResponsiveSize(8)),
    marginBottom: verticalScale(getResponsiveSize(8)),
  },
  doctorName: {
    marginLeft: scale(getResponsiveSize(6)),
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#1A3848',
  },
  noDoctorText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    fontStyle: 'italic',
  },
  moreDoctors: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: scale(getResponsiveSize(12)),
    paddingVertical: verticalScale(getResponsiveSize(6)),
    borderRadius: moderateScale(getResponsiveSize(20)),
  },
  moreDoctorsText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#1A3848',
  },
  viewDetailsButton: {
    backgroundColor: '#F87F16',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(getResponsiveSize(12)),
    borderRadius: moderateScale(getResponsiveSize(8)),
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    marginRight: scale(getResponsiveSize(8)),
  },
});

export default TestAndDiscussion;