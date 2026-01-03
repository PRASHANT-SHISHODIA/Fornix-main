import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Topiclist = () => {

  // 🔹 Topic data
  const topics = [
    { id: '1', name: 'Blood Supply of Heart' },
    { id: '2', name: 'Cranial Nerves' },
    { id: '3', name: 'Respiratory System' },
    { id: '4', name: 'Digestive System' },
    { id: '5', name: 'Nervous System' },
    { id: '6', name: 'Muscular System' },
  ];

  // 🔹 Selected topics state (multiple allowed)
  const [selectedTopics, setSelectedTopics] = useState([]);
  const navigation = useNavigation();

  // 🔹 Toggle checkbox
  const toggleTopic = (id) => {
    setSelectedTopics(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* 🔹 Header */}
      <Text style={styles.heading}>Select Topics</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {topics.map(topic => {
            const isSelected = selectedTopics.includes(topic.id);

            return (
              <TouchableOpacity
                key={topic.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => toggleTopic(topic.id)}
                activeOpacity={0.8}
              >
                {/* Checkbox */}
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxChecked,
                  ]}
                >
                  {isSelected && (
                    <Icon name="check" size={14} color="#fff" />
                  )}
                </View>

                {/* Topic Name */}
                <Text style={styles.topicText}>
                  {topic.name}
                </Text>
              </TouchableOpacity>
            );
          })}

        </View>
        <View style={styles.buttonWrapper}>
  <TouchableOpacity
    style={[
      styles.quizButton,
      selectedTopics.length === 0 && styles.disabledButton,
    ]}
    disabled={selectedTopics.length === 0}
    onPress={() => {
      console.log('Selected Topics:', selectedTopics);
      navigation.navigate('Fornixqbank1', { topics: selectedTopics });
    }}
    activeOpacity={0.8}
  >
    <Text style={styles.quizButtonText}>Start Quiz</Text>
  </TouchableOpacity>
</View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Topiclist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
    paddingHorizontal: 16,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 20,
    textAlign: 'center',
  },

  listContainer: {
    paddingBottom: 20,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3848',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  cardSelected: {
    borderWidth: 2,
    borderColor: '#F87F16',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F87F16',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  checkboxChecked: {
    backgroundColor: '#F87F16',
  },

  topicText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  butoview:{
    flex:1,
    marginTop:50,
    alignContent:'center',
    width :"90%",
  },
  Quizbuto:{
    width:'80%',
    height:'100%',
    backgroundColor:'#1A3848',
  },
  buttonWrapper: {
  marginTop: 30,
  marginBottom: 40,
  alignItems: 'center',
},

quizButton: {
  width: '90%',
  height: 52,
  backgroundColor: '#1A3848',
  borderRadius: 14,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 4,
},

quizButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

disabledButton: {
  backgroundColor: '#9aa5ad',
},

   
});
