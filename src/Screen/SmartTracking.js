import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

/* ===================== API ===================== */
const API_URL =
  'https://fornix-medical.vercel.app/api/v1/smart-tracking/compute';

const REQUEST_BODY = {
  user_id: '2f037c77-2641-4bcf-b68b-56ae983b218e',
  course_id: 'cc613b33-3986-4d67-b33a-009b57a72dc8',
};

/* ===================== AXIOS ===================== */
const api = axios.create({
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

/* ===================== COMPONENT ===================== */
const SmartTracking = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  /* ===================== FETCH ===================== */
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const response = await api.post(API_URL, REQUEST_BODY);

      if (response?.data?.success) {
        setData(response.data);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (e) {
      console.log('SMART TRACKING ERROR:', e);
      setError('Unable to load smart tracking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = d =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'No activity';

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#F87F16" />
        <Text style={styles.loadingText}>Analyzing performance…</Text>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const {
    weaknesses = [],
    study_plan = [],
    pacing = {},
    next_actions = [],
  } = data.data || {};

  const metrics = data.metrics || {};

  /* ===================== UI ===================== */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {/* HEADER */}
        <View style={styles.header}>
          <Icon name="chart-line" size={26} color="#fff" />
          <Text style={styles.headerTitle}>Smart Tracking</Text>
        </View>

        {/* OVERVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text>Tests Attempted: {metrics.test_attempts_count ?? 0}</Text>
          <Text>Quizzes Attempted: {metrics.quiz_attempts_count ?? 0}</Text>
          <Text>Avg Test Score: {metrics.avg_test_score ?? 0}%</Text>
          <Text>Avg Quiz Score: {metrics.avg_quiz_score ?? 0}%</Text>
          <Text>Last Activity: {formatDate(metrics.last_activity)}</Text>
        </View>

        {/* WEAK AREAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weak Areas</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={weaknesses}
            keyExtractor={item => item.area_id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.area_name}</Text>
                <Text style={styles.smallText}>{item.reason}</Text>
                <Text>Severity: {item.severity}/5</Text>
                <Text>Confidence: {item.confidence}%</Text>
              </View>
            )}
          />
        </View>

        {/* STUDY PLAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Plan</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={study_plan}
            keyExtractor={item => item.area_id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.area_name}</Text>
                <Text>{item.weeks} weeks</Text>
                <Text>{item.hours_per_week} hrs/week</Text>
                <Text style={styles.smallText}>{item.milestone}</Text>
              </View>
            )}
          />
        </View>

        {/* PACING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pacing Summary</Text>
          <Text>Total Weeks: {pacing.total_weeks}</Text>
          <Text>Weekly Hours: {pacing.weekly_hours}</Text>
        </View>

        {/* NEXT ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Actions</Text>
          {next_actions.map((action, index) => (
            <Text key={index} style={styles.bullet}>
              • {action}
            </Text>
          ))}
        </View>

        {error && (
          <View style={styles.error}>
            <Text>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12 },

  header: {
    backgroundColor: '#F87F16',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, marginTop: 6 },

  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#F8F8F8',
    padding: 14,
    borderRadius: 10,
    marginRight: 12,
    width: width * 0.75,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  smallText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },

  bullet: {
    marginBottom: 6,
    fontSize: 14,
  },

  error: {
    backgroundColor: '#FFE5E5',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default SmartTracking;
