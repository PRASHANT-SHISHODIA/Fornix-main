import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

/* 🔹 Responsive helpers */
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const getResponsiveSize = size => {
  if (width < 375) return size * 0.85;
  if (width > 414) return size * 1.15;
  return size;
};

const getHeaderTransform = () => {
  if (width < 375) return 1.6;
  if (width > 414) return 1.8;
  return 1.7;
};

const Selected = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { mood, ChapterName,chapterId} = route?.params;
  console.log("TOPIC SCREEN MOOD ", mood?.title);
  console.log("R", route.params)


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F87F16" barStyle="light-content" />

      {/* 🔹 HEADER */}
      <LinearGradient
        colors={['#F87F16', '#FF9800']}
        style={[
          styles.header,
          {
            paddingTop: insets.top + verticalScale(60),
            height: verticalScale(220),
            borderBottomLeftRadius: scale(350),
            borderBottomRightRadius: scale(350),
            transform: [{ scaleX: getHeaderTransform() }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon1 name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Quiz Mode</Text>
          </View>
        </View>


      </LinearGradient>

      {/* 🔹 OVERLAPPED CONTENT */}
      <View style={styles.overlapContainer}>
        {/* Start Quiz */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (mood) {
              navigation.navigate('Fornixqbank2', {
                mode: 'DIRECT',
                mood: mood,
                chapterId:chapterId,
                ChapterName:ChapterName,
              })
            } else {
              navigation.navigate('Fornixqbank2', {
                mode: 'DIRECT',
                chapterId:chapterId,
                ChapterName:ChapterName,
                // mood:mood,
              })
            }
          }

          }
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#F87F16', '#FF9800']}
            style={styles.buttonGradient}
          >
            <Icon name="play-circle" size={24} color="#fff" />
            <Text style={styles.primaryText}>Start Quiz</Text>
          </LinearGradient>

          <Text style={styles.buttonDescription}>
            Jump directly into a mixed topic quiz
          </Text>
        </TouchableOpacity>

        {/* Select Topic */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            if (mood) {
              navigation.navigate('Topicwise', {
                mood: mood,
              });
            } else {
              navigation.navigate('Topicwise');
            }
          }}

          activeOpacity={0.9}
        >
          <View style={styles.secondaryIcon}>
            <Icon name="book-medical" size={24} color="#1A3848" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.secondaryText}>Select Topic</Text>
            <Text style={styles.buttonDescription}>
              Choose specific topics to focus on
            </Text>
          </View>

          <Icon name="chevron-right" size={18} color="#1A3848" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Selected;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  header: {
    paddingHorizontal: scale(20),
  },

  headerContent: {
    // flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    justifyContent: 'space-between'
  },

  backButton: {
    flex: 1,
    // width: 40,
    // height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    marginLeft: 25,
    justifyContent: 'center',


  },

  headerText: {
    // flex: 1,
    alignItems: 'center',
    marginRight: 40,
  },

  title: {
    fontSize: moderateScale(22),
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },

  // subtitle: {
  //   fontSize: moderateScale(11),
  //   color: 'rgba(255,255,255,0.9)',
  //   marginTop: 2,
  // },

  /* 🔥 OVERLAP */
  overlapContainer: {
    flex: 1,
    marginTop: verticalScale(70),
    paddingHorizontal: scale(30),
  },

  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: verticalScale(25),
    elevation: 10,
  },

  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 12,
  },

  primaryText: {
    color: '#fff',
    fontSize: moderateScale(18),
    marginLeft: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },

  secondaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(26,56,72,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  secondaryText: {
    fontSize: moderateScale(18),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
  },

  buttonDescription: {
    fontSize: moderateScale(13),
    color: '#666',
    marginTop: 4,
  },
});
