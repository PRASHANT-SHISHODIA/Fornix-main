import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

/* ===================== SCREEN SIZE ===================== */
const { width, height } = Dimensions.get('window');

/* ===================== RESPONSIVE HELPERS ===================== */
const scale = s => (width / 375) * s;
const verticalScale = s => (height / 812) * s;
const moderateScale = (s, f = 0.5) => s + (scale(s) - s) * f;

const getResponsiveSize = (size) => {
  if (width < 375) return size * 0.85;
  else if (width > 414) return size * 1.15;
  return size;
};

const getHeaderTransform = () => {
  if (width < 375) return 1.6;
  if (width > 414) return 1.8;
  return 1.7;
};

const getSearchTransform = () => {
  if (width < 375) return 0.62;
  if (width > 414) return 0.55;
  return 0.58;
};

/* ===================== API ===================== */
const api = axios.create({
  baseURL: 'https://fornix-medical.vercel.app/api/v1/mobile',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const PYTsTopicScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const { subjectId, subjectName } = route.params;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /* ===================== FETCH TOPICS ===================== */
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post('/pyt/topics', {
        subject_id: subjectId,
        year: '', // optional filter
      });

      if (res.data?.success) {
        setTopics(res.data.topics || []);
      } else {
        setError('Failed to load topics');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Filter topics based on search
  const filteredTopics = topics.filter(topic =>
    topic.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.sub_topics?.some(st => st.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon1
                name="search"
                size={moderateScale(getResponsiveSize(20))}
                color="white"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search topics"
                placeholderTextColor="white"
                value={searchQuery}
                onChangeText={setSearchQuery}
                editable={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A3848" />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      </View>
    );
  }

  /* ===================== ERROR ===================== */
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon1
                name="search"
                size={moderateScale(getResponsiveSize(20))}
                color="white"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search topics"
                placeholderTextColor="white"
                value={searchQuery}
                onChangeText={setSearchQuery}
                editable={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={scale(60)} color="#F87F16" />
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={fetchTopics}>
            <Icon name="sync-alt" size={scale(16)} color="white" />
            <Text style={styles.retryText}> Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ===================== MAIN UI ===================== */
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon1
                name="search"
                size={moderateScale(getResponsiveSize(20))}
                color="white"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search topics"
                placeholderTextColor="white"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon1
                    name="close-circle"
                    size={moderateScale(getResponsiveSize(18))}
                    color="white"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{subjectName} - Topics</Text>
          <View style={styles.infoRow}>
            <Text style={styles.count}>
              {filteredTopics.length} {filteredTopics.length === 1 ? 'Topic' : 'Topics'}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearFilterText}>Clear filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Topic Cards */}
        {filteredTopics.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredTopics.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  index % 2 === 0 ? styles.cardEven : styles.cardOdd,
                ]}
              >
                <Text style={styles.topicName}>{item.topic}</Text>

                {/* Years */}
                {item.years?.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.yearsContainer}
                  >
                    {item.years.slice(0, 5).map((year, idx) => (
                      <View key={idx} style={styles.yearTag}>
                        <Text style={styles.yearText}>{year}</Text>
                      </View>
                    ))}
                    {item.years.length > 5 && (
                      <View style={styles.moreTag}>
                        <Text style={styles.moreText}>+{item.years.length - 5} more</Text>
                      </View>
                    )}
                  </ScrollView>
                ) : (
                  <View style={styles.noYearsContainer}>
                    <Text style={styles.noYearsText}>No years available</Text>
                  </View>
                )}

                {/* Sub Topics */}
                {item.sub_topics?.length > 0 && (
                  <View style={styles.subTopicBox}>
                    {item.sub_topics.slice(0, 3).map((st, i) => (
                      <Text key={i} style={styles.subTopicText}>
                        • {st}
                      </Text>
                    ))}
                    {item.sub_topics.length > 3 && (
                      <Text style={styles.moreSubTopicsText}>
                        +{item.sub_topics.length - 3} more subtopics
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="folder-open" size={scale(70)} color="#1A3848" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No topics found for your search' : 'No topics available'}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {filteredTopics.length > 0 ? 'Scroll to see all topics' : 'Try a different search term'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

/* ===================== STYLES ===================== */
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
    paddingTop: verticalScale(getResponsiveSize(40)),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(22)),
    paddingHorizontal: scale(getResponsiveSize(15)),
    paddingVertical: verticalScale(getResponsiveSize(3)),
  },
  searchIcon: {
    marginRight: scale(getResponsiveSize(10)),
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: moderateScale(getResponsiveSize(14)),
    color: 'white',
    includeFontPadding: false,
  },
  titleContainer: {
    paddingHorizontal: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  title: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginBottom: verticalScale(getResponsiveSize(5)),
    includeFontPadding: false,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    includeFontPadding: false,
  },
  clearFilterText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },
  listContainer: {
    paddingHorizontal: scale(getResponsiveSize(15)),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: moderateScale(getResponsiveSize(12)),
    padding: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(15)),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardEven: {
    borderLeftWidth: scale(4),
    borderLeftColor: '#1A3848',
  },
  cardOdd: {
    borderLeftWidth: scale(4),
    borderLeftColor: '#F87F16',
  },
  topicName: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginBottom: verticalScale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
  yearsContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(getResponsiveSize(10)),
  },
  yearTag: {
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(getResponsiveSize(6)),
    paddingHorizontal: scale(getResponsiveSize(8)),
    paddingVertical: verticalScale(getResponsiveSize(3)),
    marginRight: scale(getResponsiveSize(5)),
    marginBottom: verticalScale(getResponsiveSize(3)),
  },
  yearText: {
    fontSize: moderateScale(getResponsiveSize(10)),
    fontFamily: 'Poppins-Medium',
    color: '#1A3848',
    includeFontPadding: false,
  },
  moreTag: {
    backgroundColor: '#F87F16',
    borderRadius: moderateScale(getResponsiveSize(6)),
    paddingHorizontal: scale(getResponsiveSize(8)),
    paddingVertical: verticalScale(getResponsiveSize(3)),
    marginBottom: verticalScale(getResponsiveSize(3)),
  },
  moreText: {
    fontSize: moderateScale(getResponsiveSize(10)),
    fontFamily: 'Poppins-Medium',
    color: 'white',
    includeFontPadding: false,
  },
  noYearsContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: moderateScale(getResponsiveSize(6)),
    paddingHorizontal: scale(getResponsiveSize(8)),
    paddingVertical: verticalScale(getResponsiveSize(3)),
    alignSelf: 'flex-start',
    marginBottom: verticalScale(getResponsiveSize(10)),
  },
  noYearsText: {
    fontSize: moderateScale(getResponsiveSize(10)),
    fontFamily: 'Poppins-Medium',
    color: '#856404',
    includeFontPadding: false,
  },
  subTopicBox: {
    marginTop: verticalScale(getResponsiveSize(5)),
  },
  subTopicText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#555',
    marginBottom: verticalScale(getResponsiveSize(3)),
    includeFontPadding: false,
  },
  moreSubTopicsText: {
    fontSize: moderateScale(getResponsiveSize(11)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    marginTop: verticalScale(getResponsiveSize(3)),
    includeFontPadding: false,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(getResponsiveSize(100)),
  },
  loadingText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-Medium',
    color: '#1A3848',
    marginTop: verticalScale(getResponsiveSize(20)),
    includeFontPadding: false,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(getResponsiveSize(100)),
    paddingHorizontal: scale(getResponsiveSize(40)),
  },
  errorText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: verticalScale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(30)),
    includeFontPadding: false,
  },
  retryButton: {
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(8)),
    paddingHorizontal: scale(getResponsiveSize(25)),
    paddingVertical: verticalScale(getResponsiveSize(12)),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(10)),
  },
  retryText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    includeFontPadding: false,
  },
  backText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    marginTop: verticalScale(getResponsiveSize(10)),
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(getResponsiveSize(50)),
    paddingHorizontal: scale(getResponsiveSize(40)),
  },
  emptyText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    textAlign: 'center',
    marginTop: verticalScale(getResponsiveSize(20)),
    includeFontPadding: false,
  },
  clearSearchText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    marginTop: verticalScale(getResponsiveSize(15)),
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },
  footerContainer: {
    marginTop: verticalScale(getResponsiveSize(30)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  footerText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default PYTsTopicScreen;