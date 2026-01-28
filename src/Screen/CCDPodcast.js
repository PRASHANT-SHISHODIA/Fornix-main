// CCDPodcast.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Image,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Screen dimensions
const { width, height } = Dimensions.get('window');

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

const CCDPodcast = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // State for API data
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Course ID - replace with actual course ID from your app
  const courseId = "cc613b33-3986-4d67-b33a-009b57a72dc8";

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setError(null);
      const response = await fetch('https://fornix-medical.vercel.app/api/v1/podcasts/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
          media_type: null // "audio"/"video"
        })
      });

      const data = await response.json();

      if (data.success) {
        // Sort subjects by podcasts_count in descending order
        const sortedSubjects = data.data.sort((a, b) => b.podcasts_count - a.podcasts_count);
        setSubjects(sortedSubjects);
      } else {
        setError('Failed to fetch subjects');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };

  const handleSubjectPress = (subject) => {
    if (!courseId) {
      console.log('Course ID missing');
      return;
    }

    navigation.navigate('SubjectPodcasts', {
      courseId: courseId,          // ✅ from AsyncStorage
      subjectId: subject.id,       // ✅ clicked subject
      subjectName: subject.name,   // (optional)
    });
  };

  // Render subject card
  const renderSubjectCard = (subject, index) => {
    const isFirst = index === 0;
    const hasPodcasts = subject.podcasts_count > 0;

    return (
      <TouchableOpacity
        key={subject.id}
        style={[
          styles.subjectCard,
          isFirst && styles.firstSubjectCard
        ]}
        onPress={() =>handleSubjectPress(subject)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isFirst ? ['#F87F16', '#FF9E40'] : ['#1A3848', '#2C4A5E']}
          style={styles.subjectGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.subjectContent}>
            <View style={styles.subjectHeader}>
              <View style={styles.subjectTitleContainer}>
                <Text style={[
                  styles.subjectTitle,
                  isFirst && styles.firstSubjectTitle
                ]}>
                  {subject.name}
                </Text>
                {subject.description && subject.description.trim() !== '' && (
                  <Text style={[
                    styles.subjectDescription,
                    isFirst && styles.firstSubjectDescription
                  ]}>
                    {subject.description}
                  </Text>
                )}
              </View>

              <View style={[
                styles.podcastCountBadge,
                isFirst && styles.firstPodcastCountBadge
              ]}>
                <Icon
                  name="podcast"
                  size={moderateScale(getResponsiveSize(12))}
                  color={isFirst ? '#F87F16' : 'white'}
                />
                <Text style={[
                  styles.podcastCountText,
                  isFirst && styles.firstPodcastCountText
                ]}>
                  {subject.podcasts_count}
                </Text>
              </View>
            </View>

            <View style={styles.subjectFooter}>
              <View style={styles.podcastInfo}>
                <Icon
                  name={hasPodcasts ? 'play-circle' : 'clock'}
                  size={moderateScale(getResponsiveSize(14))}
                  color={isFirst ? 'white' : '#F87F16'}
                />
                <Text style={[
                  styles.podcastInfoText,
                  isFirst && styles.firstPodcastInfoText
                ]}>
                  {hasPodcasts ? `${subject.podcasts_count} Podcast${subject.podcasts_count !== 1 ? 's' : ''} Available` : 'Coming Soon'}
                </Text>
              </View>

              <TouchableOpacity style={[
                styles.viewButton,
                isFirst && styles.firstViewButton
              ]}>
                <Text style={[
                  styles.viewButtonText,
                  isFirst && styles.firstViewButtonText
                ]}>
                  View
                </Text>
                <Icon
                  name="arrow-right"
                  size={moderateScale(getResponsiveSize(12))}
                  color={isFirst ? '#F87F16' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F87F16']}
            tintColor="#F87F16"
          />
        }
      >
        {/* 🔹 Header - Same as Mood.js */}
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
              <Text style={styles.title}>CCD Podcast</Text>
              <TouchableOpacity 
                style={styles.refreshIcon} 
                onPress={fetchSubjects}
              >
                <Icon 
                  name="sync-alt" 
                  size={moderateScale(getResponsiveSize(20))} 
                  color={refreshing ? "#FFF" : "rgba(255,255,255,0.8)"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.subTitle}>Comprehensive Podcast Library</Text>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {subjects.length}
                </Text>
                <Text style={styles.statLabel}>Subjects</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {subjects.reduce((total, subject) => total + subject.podcasts_count, 0)}
                </Text>
                <Text style={styles.statLabel}>Podcasts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🔹 Stats Banner */}
        <LinearGradient
          colors={['#1A3848', '#2C4A5E']}
          style={styles.statsBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.statItem}>
            <Icon name="book-medical" size={moderateScale(getResponsiveSize(24))} color="#F87F16" />
            <Text style={styles.statNumber}>
              {subjects.length}
            </Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Icon name="podcast" size={moderateScale(getResponsiveSize(24))} color="#F87F16" />
            <Text style={styles.statNumber}>
              {subjects.reduce((total, subject) => total + subject.podcasts_count, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Podcasts</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Icon name="star" size={moderateScale(getResponsiveSize(24))} color="#F87F16" />
            <Text style={styles.statNumber}>
              {subjects.filter(s => s.podcasts_count > 0).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </LinearGradient>

        {/* Loading State */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#F87F16" />
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="exclamation-triangle" size={moderateScale(getResponsiveSize(50))} color="#F87F16" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchSubjects}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="podcast" size={moderateScale(getResponsiveSize(50))} color="#F87F16" />
            <Text style={styles.emptyText}>No subjects available</Text>
            <Text style={styles.emptySubText}>Check back later for updates</Text>
          </View>
        ) : (
          <>
            {/* Featured Subject (First one with podcasts) */}
            {subjects.length > 0 && subjects[0].podcasts_count > 0 && (
              <View style={styles.featuredContainer}>
                <Text style={styles.sectionTitle}>Featured Subject</Text>
                <Text style={styles.sectionSubtitle}>Most podcasts available</Text>
                {renderSubjectCard(subjects[0], 0)}
              </View>
            )}

            {/* All Subjects */}
            <View style={styles.subjectsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Subjects</Text>
                <Text style={styles.sectionCount}>({subjects.length})</Text>
              </View>

              <View style={styles.subjectsGrid}>
                {subjects.slice(1).map((subject, index) => renderSubjectCard(subject, index + 1))}
              </View>
            </View>

            {/* Subjects by Category */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitle}>Browse by Status</Text>

              <View style={styles.categoryRow}>
                <TouchableOpacity style={styles.categoryCard}>
                  <LinearGradient
                    colors={['#1A3848', '#2C4A5E']}
                    style={styles.categoryGradient}
                  >
                    <Icon name="play-circle" size={moderateScale(getResponsiveSize(24))} color="#F87F16" />
                    <Text style={styles.categoryTitle}>Available Now</Text>
                    <Text style={styles.categoryCount}>
                      {subjects.filter(s => s.podcasts_count > 0).length} Subjects
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.categoryCard}>
                  <LinearGradient
                    colors={['#1A3848', '#2C4A5E']}
                    style={styles.categoryGradient}
                  >
                    <Icon name="clock" size={moderateScale(getResponsiveSize(24))} color="#F87F16" />
                    <Text style={styles.categoryTitle}>Coming Soon</Text>
                    <Text style={styles.categoryCount}>
                      {subjects.filter(s => s.podcasts_count === 0).length} Subjects
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Footer Space */}
        <View style={styles.footerSpace} />
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
  // 🔹 Header Styles (Same as Mood.js)
  header: {
    backgroundColor: '#F87F16',
    marginBottom: verticalScale(getResponsiveSize(20)),
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(10)),
  },
  backButton: {
    paddingHorizontal: scale(getResponsiveSize(10)),
    zIndex: 1,
  },
  title: {
    fontSize: moderateScale(getResponsiveSize(24)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    includeFontPadding: false,
  },
  refreshIcon: {
    paddingHorizontal: scale(getResponsiveSize(10)),
  },
  subTitle: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(15)),
    includeFontPadding: false,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: verticalScale(getResponsiveSize(10)),
    borderRadius: moderateScale(getResponsiveSize(15)),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: verticalScale(getResponsiveSize(20)),
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  statNumber: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  statLabel: {
    fontSize: moderateScale(getResponsiveSize(10)),
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.9)',
    marginTop: verticalScale(getResponsiveSize(2)),
  },
  // 🔹 Rest of the styles remain the same
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: scale(getResponsiveSize(20)),
    marginTop: verticalScale(getResponsiveSize(20)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    borderRadius: moderateScale(getResponsiveSize(20)),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(getResponsiveSize(100)),
  },
  loadingText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-Medium',
    color: '#1A3848',
    marginTop: verticalScale(getResponsiveSize(20)),
  },
  errorText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-Medium',
    color: '#1A3848',
    marginTop: verticalScale(getResponsiveSize(20)),
    textAlign: 'center',
    paddingHorizontal: scale(getResponsiveSize(40)),
  },
  retryButton: {
    backgroundColor: '#F87F16',
    paddingHorizontal: scale(getResponsiveSize(30)),
    paddingVertical: verticalScale(getResponsiveSize(12)),
    borderRadius: moderateScale(getResponsiveSize(25)),
    marginTop: verticalScale(getResponsiveSize(20)),
  },
  retryButtonText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  emptyText: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginTop: verticalScale(getResponsiveSize(20)),
  },
  emptySubText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: verticalScale(getResponsiveSize(10)),
  },
  featuredContainer: {
    marginHorizontal: scale(getResponsiveSize(20)),
    marginTop: verticalScale(getResponsiveSize(20)),
  },
  subjectsContainer: {
    marginHorizontal: scale(getResponsiveSize(20)),
    marginTop: verticalScale(getResponsiveSize(20)),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  sectionTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
  },
  sectionSubtitle: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: verticalScale(getResponsiveSize(5)),
  },
  sectionCount: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    marginLeft: scale(getResponsiveSize(5)),
  },
  subjectsGrid: {
    marginTop: verticalScale(getResponsiveSize(10)),
  },
  subjectCard: {
    marginBottom: verticalScale(getResponsiveSize(15)),
    borderRadius: moderateScale(getResponsiveSize(15)),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  firstSubjectCard: {
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  subjectGradient: {
    padding: scale(getResponsiveSize(20)),
  },
  subjectContent: {
    flex: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  subjectTitleContainer: {
    flex: 1,
    marginRight: scale(getResponsiveSize(10)),
  },
  subjectTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: 'white',
    marginBottom: verticalScale(getResponsiveSize(5)),
  },
  firstSubjectTitle: {
    fontSize: moderateScale(getResponsiveSize(20)),
  },
  subjectDescription: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  firstSubjectDescription: {
    fontSize: moderateScale(getResponsiveSize(14)),
  },
  podcastCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: scale(getResponsiveSize(10)),
    paddingVertical: verticalScale(getResponsiveSize(5)),
    borderRadius: moderateScale(getResponsiveSize(15)),
  },
  firstPodcastCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  podcastCountText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginLeft: scale(getResponsiveSize(5)),
  },
  firstPodcastCountText: {
    fontSize: moderateScale(getResponsiveSize(14)),
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podcastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastInfoText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    marginLeft: scale(getResponsiveSize(8)),
  },
  firstPodcastInfoText: {
    color: 'white',
    fontSize: moderateScale(getResponsiveSize(14)),
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F87F16',
    paddingHorizontal: scale(getResponsiveSize(15)),
    paddingVertical: verticalScale(getResponsiveSize(8)),
    borderRadius: moderateScale(getResponsiveSize(20)),
  },
  firstViewButton: {
    backgroundColor: 'white',
  },
  viewButtonText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginRight: scale(getResponsiveSize(5)),
  },
  firstViewButtonText: {
    color: '#F87F16',
  },
  categoriesContainer: {
    marginHorizontal: scale(getResponsiveSize(20)),
    marginTop: verticalScale(getResponsiveSize(20)),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(getResponsiveSize(10)),
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: scale(getResponsiveSize(5)),
    borderRadius: moderateScale(getResponsiveSize(15)),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryGradient: {
    padding: scale(getResponsiveSize(20)),
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginTop: verticalScale(getResponsiveSize(10)),
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: verticalScale(getResponsiveSize(5)),
    textAlign: 'center',
  },
  footerSpace: {
    height: verticalScale(getResponsiveSize(30)),
  },
});

export default CCDPodcast;