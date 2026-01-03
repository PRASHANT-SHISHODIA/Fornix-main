import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon1 from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Signup = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        navigation.replace("TabNavigation"); // 👈 already logged in
      }
    } catch (error) {
      console.log("Auth check error", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);


  return (
    <View style={[styles.container,{paddingTop: insets.top}]}>
      
      {/* Title */}
      <Text style={styles.title}>Let's You In</Text>

      {/* Social Login Buttons */}
      <TouchableOpacity style={styles.socialButton}>
        <Image 
          source={{uri: 'https://pngimg.com/uploads/google/google_PNG19630.png'}}
          style={styles.iconImage}
        />
        <Text style={styles.socialButtonText}>Continue With Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
          <Icon name="apple" size={25} color="" style={styles.icon} />
        <Text style={styles.socialButtonText}>Continue With Apple</Text>
      </TouchableOpacity>

      {/* Separator */}
      <View style={styles.separatorContainer}>
        <Text style={styles.separatorText}>Or</Text>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton} onPress={()=> navigation.navigate("Signupdetail")} >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have account */}
      <TouchableOpacity style={styles.loginLink}  onPress={()=> navigation.navigate("Logindetail")} >
        <Text style={styles.loginText}>I already have an account</Text>
          <Icon1 name="arrow-forward" size={16} color="black" style={styles.icon1} />
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
    fontSize: 30,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginBottom: 50,
    textAlign: 'center',

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
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorText: {
    color: 'white',
    fontSize: 19,
    textAlign:"center",
    fontFamily: 'Poppins-SemiBold',
  },
  signUpButton: {
    backgroundColor: '#1A3848',
    borderRadius: 12,
    paddingVertical: 12,
    width: width - 48,
    alignItems: 'center',
    marginBottom: 2,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
  },
  loginLink: {
    paddingVertical: 7,
    flexDirection:"row",
    gap:10
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
  },
  icon1:{ alignSelf:"center",backgroundColor:"white",borderRadius:20,padding:2 },
   icon: {
    marginRight: 15,
  },
});

export default Signup;