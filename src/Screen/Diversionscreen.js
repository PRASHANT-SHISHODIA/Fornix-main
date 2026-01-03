import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Diversionscreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
    
      {/* Student Option Button */}
      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => navigation.navigate("TabNavigation")} // Update with your actual navigation target
      >
        <View style={styles.iconContainer}>
          <Icon name="user-graduate" size={30} color="#1A3848" style={styles.optionIcon} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>Student</Text>
          <Text style={styles.optionSubtitle}>Want to join as a student</Text>
        </View>
        <Icon1 name="chevron-forward" size={20} color="#1A3848" style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* University Option Button */}
      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => navigation.navigate("UniversitySignup")} // Update with your actual navigation target
      >
        <View style={styles.iconContainer}>
          <Icon name="university" size={30} color="#1A3848" style={styles.optionIcon} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>University</Text>
          <Text style={styles.optionSubtitle}>Want to join as a university</Text>
        </View>
        <Icon1 name="chevron-forward" size={20} color="#1A3848" style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginBottom: 50,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 10,
    width: width - 40,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIcon: {
    // Icon styling is handled in the Icon component
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1A3848',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
  },
  arrowIcon: {
    // Arrow icon styling
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  separatorText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginHorizontal: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: width - 48,
    marginBottom: 16,
  },
  iconImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000',
  },
  icon: {
    marginRight: 12,
  },
  loginLink: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  loginArrowIcon: { 
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    marginLeft: 8,
  },
});

export default Diversionscreen;