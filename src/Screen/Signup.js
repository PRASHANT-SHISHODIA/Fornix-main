import React, { useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

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

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "1032712248044-88o09oaf1a3ue5ne5g7hi91o69mcoi40.apps.googleusercontent.com", // 👈 YOUR CLIENT ID
      offlineAccess: true,
      // hostedDomain: '', // 👈 if you want to restrict to a specific domain
      // loginHint: '', // 👈 if you want to pre-fill the email fiel 
      //  forceconsentPrompt: true, // 👈 to always show the consent promp't   
      forceCodeForRefreshToken: true,
    });

    checkAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      console.log('FULL GOOGLE USER INFO 👉', JSON.stringify(userInfo, null, 2));

      const idToken = userInfo.idToken || userInfo.data?.idToken;

      if (!idToken) {
        console.log("google id token", idToken)
        Alert.alert('Error', 'Google ID Token not received');
        return;
      }

      console.log('GOOGLE ID TOKEN 👉', idToken);

      // 🔥 OPTION 1: Direct login (temporary)
      await AsyncStorage.setItem('token', idToken);
      await AsyncStorage.setItem(
        'google_user',
        JSON.stringify(userInfo.user)
      );

      navigation.replace('TabNavigation');

      // 🔥 OPTION 2 (BEST): Backend / Redux call
      // dispatch(googleLogin(idToken));

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google login already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play Services not available');
      } else {
        console.error('Google Sign-In Error:', error.message);
        Alert.alert('Error', error.message || 'Google Sign-In failed');
      }
    }
  };




  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/Images/Fornix2.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Let's Get You In</Text>


      {/* Social Login Buttons */}
      {/* <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
        <Image
          source={{ uri: 'https://pngimg.com/uploads/google/google_PNG19630.png' }}
          style={styles.iconImage}
        />
        <Text style={styles.socialButtonText}>Continue With Google</Text>
      </TouchableOpacity> */}

      {/* <TouchableOpacity style={styles.socialButton}>
        <Icon name="apple" size={25} color="" style={styles.icon} />
        <Text style={styles.socialButtonText}>Continue With Apple</Text>
      </TouchableOpacity> */}

      {/* Separator */}
      {/* <View style={styles.separatorContainer}>
        <Text style={styles.separatorText}>Or</Text>
      </View> */}

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate("Signupdetail", { params: { direct: false } })} >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have account */}
      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Logindetail")} >
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
    marginBottom: 20,
    textAlign: 'center',

  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  image: {
    width: width * 0.9,
    height: 300,
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
    textAlign: "center",
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
    flexDirection: "row",
    gap: 10
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
  },
  icon1: { alignSelf: "center", backgroundColor: "white", borderRadius: 20, padding: 2 },
  icon: {
    marginRight: 15,
  },
});

export default Signup;