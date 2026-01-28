import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

/* ---------- Responsive Calculations ---------- */
const scale = s => {
  const guidelineBaseWidth = 375;
  return (width / guidelineBaseWidth) * s;
};

const responsiveHeight = h => {
  const guidelineBaseHeight = 812;
  return (height / guidelineBaseHeight) * h;
};

// Responsive scaling functions from Mood.js
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Get responsive padding and margins
const getResponsiveSize = (size) => {
  if (width < 375) { // Small phones
    return size * 0.85;
  } else if (width > 414) { // Large phones
    return size * 1.1;
  }
  return size; // Normal phones
};

/* ---------- API ---------- */
const PODCAST_API = 'https://fornix-medical.vercel.app/api/v1/podcasts';

const SubjectPodcasts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { courseId, subjectId, subjectName } = route.params || {};

  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ---------- Back Button Handler ---------- */
  const handleBack = () => {
    navigation.goBack();
  };

  /* ---------- Fetch Podcasts ---------- */
  const fetchPodcasts = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.post(PODCAST_API, {
        course_id: courseId,
        subject_id: subjectId,
        media_type: null,
      });

      setPodcasts(res.data?.success ? res.data.data || [] : []);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.log('Podcast API Error:', err);
      setPodcasts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (courseId && subjectId) fetchPodcasts();
  }, [courseId, subjectId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPodcasts(false);
  };

  /* ---------- Play Handler ---------- */
  const handlePlay = async (item) => {
    if (!item?.media_url) return;
    
    setSelectedPodcast(item);
    
    if (item.media_type === 'video') {
      setVideoUrl(item.media_url);
    } else {
      alert(`Playing audio: ${item.title}`);
    }
  };

  /* ---------- Filters ---------- */
  const filters = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'audio', label: 'Audio', icon: 'headphones' },
    { key: 'video', label: 'Video', icon: 'video' },
  ];

  const filteredPodcasts = podcasts.filter(p =>
    filter === 'all' ? true : p.media_type === filter
  );

  /* ---------- Helpers ---------- */
  const formatDuration = sec => {
    if (!sec) return 'N/A';
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSize = bytes => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getGradientColors = (type) => {
    return type === 'video' 
      ? ['#FF416C', '#FF4B2B'] 
      : ['#4776E6', '#8E54E9'];
  };

  /* ---------- Animation for list items ---------- */
  const cardAnimation = (index) => ({
    opacity: fadeAnim,
    transform: [{
      translateY: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0]
      })
    }]
  });

  /* ---------- Card ---------- */
  const renderItem = ({ item, index }) => {
    const isVideo = item.media_type === 'video';

    return (
      <Animated.View
        style={[styles.cardWrapper, cardAnimation(index)]}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handlePlay(item)}
        >
          <LinearGradient
            colors={getGradientColors(item.media_type)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHeader}
          >
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon
                  name={isVideo ? 'video' : 'headphones-alt'}
                  size={scale(18)}
                  color="#FFF"
                  solid
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.mediaText}>
                  {isVideo ? 'VIDEO PODCAST' : 'AUDIO PODCAST'}
                </Text>
                <Text style={styles.durationBadge}>
                  {formatDuration(item.duration_seconds)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Icon 
                name={isVideo ? 'play-circle' : 'play'} 
                size={scale(16)} 
                color="#6C63FF" 
              />
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
            </View>

            <Text style={styles.desc} numberOfLines={3}>
              {item.description || 'No description available'}
            </Text>

            <View style={styles.separator} />

            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Icon name="calendar" size={scale(12)} color="#8E8E93" />
                <Text style={styles.meta}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.footerItem}>
                <Icon name="file-download" size={scale(12)} color="#8E8E93" />
                <Text style={styles.meta}>
                  {formatSize(item.media_size_bytes)}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: getGradientColors(item.media_type)[0] }]}
              onPress={() => handlePlay(item)}
            >
              <Icon name="play" size={scale(14)} color="#FFF" />
              <Text style={styles.playButtonText}>
                {isVideo ? 'Watch Now' : 'Listen Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /* ---------- Empty State ---------- */
  const renderEmptyState = () => (
    <Animated.View 
      style={[styles.emptyContainer, { opacity: fadeAnim }]}
    >
      <View style={styles.emptyIcon}>
        <Icon name="podcast" size={scale(60)} color="#E5E5EA" />
      </View>
      <Text style={styles.emptyTitle}>No Podcasts Found</Text>
      <Text style={styles.emptyText}>
        There are no podcasts available for this subject yet.
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="sync" size={scale(14)} color="#6C63FF" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  /* ---------- UI ---------- */
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
        
        {/* 🔹 Header - Same as Mood.js */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}>
                <Icon1
                  name="arrow-back"
                  size={moderateScale(getResponsiveSize(28))}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.title}>Podcasts</Text>
              <TouchableOpacity 
                style={styles.refreshIcon} 
                onPress={onRefresh}
              >
                <Icon 
                  name="sync-alt" 
                  size={moderateScale(getResponsiveSize(20))} 
                  color={refreshing ? "#FFF" : "rgba(255,255,255,0.8)"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.subjectName} numberOfLines={1}>
              {subjectName || 'All Podcasts'}
            </Text>
            <Text style={styles.podcastCount}>
              {podcasts.length} {podcasts.length === 1 ? 'Podcast' : 'Podcasts'} Available
            </Text>
          </View>
        </View>

        {/* 🔹 Filters - Updated to match header style */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={filters}
            keyExtractor={item => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterBtn,
                  filter === item.key && styles.activeFilter,
                ]}
                activeOpacity={0.7}
              >
                <Icon
                  name={item.icon}
                  size={scale(14)}
                  color={filter === item.key ? '#FFF' : '#F87F16'}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.filterText,
                    filter === item.key && styles.activeFilterText,
                  ]}
                >
                  {item.label}
                </Text>
                {filter === item.key && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 🔹 Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F87F16" />
            <Text style={styles.loadingText}>Loading podcasts...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredPodcasts}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={renderEmptyState}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        )}
      </ScrollView>

      {/* 🔹 Video Modal */}
      <Modal
        visible={!!videoUrl}
        animationType="slide"
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.videoModalContainer}>
          <View style={styles.videoHeader}>
            <TouchableOpacity 
              style={styles.modalBackButton} 
              onPress={() => setVideoUrl(null)}
            >
              <Icon name="arrow-left" size={scale(22)} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.videoTitle} numberOfLines={1}>
              {selectedPodcast?.title || 'Video'}
            </Text>
            
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVideoUrl(null)}
            >
              <Icon name="times" size={scale(22)} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <Video
            source={{ uri: videoUrl }}
            style={styles.videoPlayer}
            controls
            resizeMode="contain"
            paused={false}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SubjectPodcasts;

/* ---------- Styles ---------- */
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
    marginRight:40,
  },
  title: {
    fontSize: moderateScale(getResponsiveSize(24)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    includeFontPadding: false,
    // marginLeft:30,
  },
  refreshIcon: {
    paddingHorizontal: scale(getResponsiveSize(10)),
  },
  subjectName: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(5)),
    includeFontPadding: false,
  },
  podcastCount: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  filterContainer: {
    backgroundColor: '#F87F16',
    paddingVertical: verticalScale(getResponsiveSize(12)),
    borderBottomLeftRadius: scale(15),
    borderBottomRightRadius: scale(15),
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  filtersList: {
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    marginRight: scale(10),
    borderRadius: scale(25),
    backgroundColor: '#FFF',
    minHeight: responsiveHeight(38),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight:30,
  },
  activeFilter: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  filterIcon: {
    marginRight: scale(6),
  },
  filterText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#F87F16',
    letterSpacing: 0.3,
  },
  activeFilterText: {
    color: '#F87F16',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -scale(5),
    width: '40%',
    height: scale(3),
    backgroundColor: '#FFF',
    borderRadius: scale(1.5),
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: responsiveHeight(300),
  },
  loadingText: {
    marginTop: scale(15),
    fontSize: scale(14),
    color: '#8E8E93',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: scale(getResponsiveSize(20)),
    paddingTop: verticalScale(getResponsiveSize(20)),
    paddingBottom: verticalScale(getResponsiveSize(30)),
  },
  cardWrapper: {
    marginBottom: responsiveHeight(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: scale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  cardHeader: {
    paddingVertical: responsiveHeight(15),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: scale(12),
    letterSpacing: 1,
    opacity: 0.9,
  },
  durationBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    color: '#FFF',
    fontSize: scale(11),
    fontWeight: '600',
  },
  cardBody: {
    padding: scale(20),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(10),
  },
  title: {
    flex: 1,
    fontSize: scale(18),
    fontWeight: '700',
    color: '#1D1D1F',
    marginLeft: scale(10),
    lineHeight: scale(24),
    fontFamily: 'Poppins-SemiBold',
  },
  desc: {
    fontSize: scale(14),
    color: '#666',
    lineHeight: scale(20),
    marginBottom: responsiveHeight(15),
    fontFamily: 'Poppins-Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F5',
    marginVertical: responsiveHeight(12),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(15),
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    fontSize: scale(12),
    color: '#8E8E93',
    marginLeft: scale(6),
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(12),
    borderRadius: scale(12),
    marginTop: scale(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: scale(14),
    fontWeight: '600',
    marginLeft: scale(8),
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(60),
  },
  emptyIcon: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#F8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(20),
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: scale(8),
    fontFamily: 'Poppins-SemiBold',
  },
  emptyText: {
    fontSize: scale(14),
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: scale(40),
    lineHeight: scale(20),
    marginBottom: responsiveHeight(25),
    fontFamily: 'Poppins-Regular',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    backgroundColor: '#F8F9FF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#F87F16',
    marginLeft: scale(8),
    fontFamily: 'Poppins-SemiBold',
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    paddingVertical: responsiveHeight(12),
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalBackButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  videoTitle: {
    flex: 1,
    fontSize: scale(14),
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
});