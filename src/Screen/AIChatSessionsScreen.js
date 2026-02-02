import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://fornix-medical.vercel.app/api/v1';

const AIChatSessionsScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');

      const res = await axios.get(
        `${API_BASE}/chat/sessions`,
        { params: { user_id: userId } }
      );

      setSessions(res.data.sessions || []);
    } catch (e) {
      console.log('Session fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('AIChatScreen', {
              sessionId: item.id,
              courseName: item.course_name,
            })
          }
        >
          <Text style={styles.title}>{item.course_name}</Text>
          <Text style={styles.time}>
            Started: {new Date(item.started_at).toLocaleString()}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});

export default AIChatSessionsScreen;
