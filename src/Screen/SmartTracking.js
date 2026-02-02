import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/* ================= API ================= */
const API_URL =
  'https://fornix-medical.vercel.app/api/v1/smart-tracking/compute';

/* ================= MAIN SCREEN ================= */
const SmartTrackingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const { width, height } = useWindowDimensions();

  /* ---------- Responsive helpers ---------- */
  const scale = (size) => (width / 375) * size;
  const verticalScale = (size) => (height / 812) * size;
  const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  const getResponsiveFontSize = (size) => {
    if (width < 375) return size * 0.85;
    if (width > 414) return size * 1.15;
    return size;
  };

  /* ================= FETCH DATA ================= */
  const fetchSmartTracking = async () => {
    try {
      setLoading(true);

      const userId = await AsyncStorage.getItem('user_id');
      const courseRaw = await AsyncStorage.getItem('selectedCourse');

      if (!userId || !courseRaw) {
        throw new Error('User or Course not found');
      }

      const course = JSON.parse(courseRaw);

      const body = {
        user_id: userId,               // ✅ STRING
        course_id: course.courseId,    // ✅ FROM STORED COURSE
      };

      const res = await axios.post(API_URL, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      setApiData(res.data);
      console.log("Data of api",res.data)
    } catch (err) {
      Alert.alert(
        'Error',
        err?.response?.data?.error || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartTracking();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F87F16" />
      </View>
    );
  }

  if (!apiData?.success) return null;

  /* ================= RESPONSE MAPPING ================= */
  const {
    course,
    metrics = {},
    data: smartData = {},
  } = apiData;

  const {
    weaknesses = [],
    study_plan = [],
    pacing = {},
    next_actions = [],
  } = smartData;

  const {
    total_weeks = 0,
    weekly_hours = 0,
    by_subject = [],
  } = pacing;

  const lastActivity = metrics.last_activity
    ? new Date(metrics.last_activity).toDateString()
    : '-';

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F87F16" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text
            style={[
              styles.courseTitle,
              { fontSize: moderateScale(getResponsiveFontSize(20)) },
            ]}
          >
            {course} – Smart Tracking
          </Text>
        </View>

        {/* ================= METRICS ================= */}
        <Card title="📊 Performance Metrics">
          <Metric label="Tests Attempted" value={metrics.test_attempts_count} />
          <Metric label="Quizzes Attempted" value={metrics.quiz_attempts_count} />
          <Metric label="Avg Test Score" value={metrics.avg_test_score} />
          <Metric label="Avg Quiz Score" value={metrics.avg_quiz_score} />
          <Metric label="Last Test Score" value={metrics.last_test_score} />
          <Metric label="Last Activity" value={lastActivity} />
        </Card>

        {/* ================= WEAKNESSES ================= */}
        <Card title="⚠️ Weak Areas">
          {weaknesses.map((w, i) => (
            <View key={i} style={styles.box}>
              <Text style={styles.bold}>{w.area_name}</Text>
              <Text style={styles.text}>{w.reason}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.meta}>Severity: {w.severity}</Text>
                <Text style={styles.meta}>Confidence: {w.confidence}%</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* ================= STUDY PLAN ================= */}
        <Card title="📚 Study Plan">
          {study_plan.map((p, i) => (
            <View key={i} style={styles.box}>
              <View style={styles.rowBetween}>
                <Text style={styles.bold}>{p.area_name}</Text>
                <Text style={styles.duration}>
                  {p.weeks} week • {p.hours_per_week} hr/week
                </Text>
              </View>

              <Text style={styles.subTitle}>Topics:</Text>
              {(p.topics || []).map((t, idx) => (
                <Text key={idx} style={styles.listItem}>• {t}</Text>
              ))}

              <Text style={styles.subTitle}>Milestone:</Text>
              <Text style={styles.textItalic}>{p.milestone}</Text>

              {p.resources?.length > 0 && (
                <>
                  <Text style={styles.subTitle}>Resources:</Text>
                  {p.resources.map((r, idx) => (
                    <Text key={idx} style={styles.listItem}>• {r}</Text>
                  ))}
                </>
              )}
            </View>
          ))}
        </Card>

        {/* ================= PACING ================= */}
        <Card title="⏱ Study Pacing">
          <View style={styles.rowBetween}>
            <Text style={styles.text}>Total Weeks: {total_weeks}</Text>
            <Text style={styles.text}>Weekly Hours: {weekly_hours}</Text>
          </View>

          {by_subject.map((s, i) => (
            <View key={i} style={styles.subjectRow}>
              <Text style={styles.text}>{s.subject_name}</Text>
              <Text style={styles.highlight}>
                {s.hours_per_week} hr/week
              </Text>
            </View>
          ))}
        </Card>

        {/* ================= NEXT ACTIONS ================= */}
        <Card title="✅ Next Actions">
          {next_actions.map((a, i) => (
            <View key={i} style={styles.actionRow}>
              <Text style={styles.highlight}>{i + 1}.</Text>
              <Text style={styles.text}>{a}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ================= SMALL COMPONENTS ================= */
const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Metric = ({ label, value }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value ?? '-'}</Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 30,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#F87F16',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1A3848',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#CBD5E1',
  },
  metricValue: {
    color: '#fff',
    fontWeight: '600',
  },
  box: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bold: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  text: {
    color: '#E2E8F0',
  },
  textItalic: {
    color: '#E2E8F0',
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  subTitle: {
    color: '#F87F16',
    fontWeight: '600',
    marginTop: 8,
  },
  listItem: {
    color: '#E2E8F0',
    marginLeft: 6,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  duration: {
    color: '#F87F16',
    fontWeight: '600',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  highlight: {
    color: '#F87F16',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
});

export default SmartTrackingScreen;
