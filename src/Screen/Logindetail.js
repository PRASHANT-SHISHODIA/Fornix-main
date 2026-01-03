import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

const LoginDetail = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // States for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [errorFields, setErrorFields] = useState({ email: false, password: false });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
//  const fetchAndSaveSubjects = async (token) => {
//   try {
//     const courseId = await AsyncStorage.getItem('course_id');

//     const response = await axios.post(
//       'https://fornix-medical.vercel.app/api/v1/subjects',
//       {
//         course_id: courseId, // 👈 BODY
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const result = response.data;

//     if (result.success && result.data?.length > 0) {

//       // ✅ SAVE ALL SUBJECTS
//       await AsyncStorage.setItem(
//         'subjects',
//         JSON.stringify(result.data)
//       );

//       // ✅ SAVE DEFAULT SUBJECT ID
//       await AsyncStorage.setItem(
//         'subject_id',
//         result.data[0].id
//       );

//       console.log('SUBJECTS SAVED:', result.data);
//     }

//   } catch (error) {
//     console.log(
//       'SUBJECT API ERROR:',
//       error.response?.data || error.message
//     );
//   }
// };


  // Handle login
  const handleLogin = async () => {
    const newErrors = {
      email: email.trim() === '',
      password: password.trim() === '',
    };

    setErrorFields(newErrors);

    if (Object.values(newErrors).some(val => val)) {
      Alert.alert('Missing Fields!', 'Please fill all the fields.');
      return;
    }

    try {
      const response = await fetch('https://fornix-medical.vercel.app/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {

        await AsyncStorage.setItem("token", data.token);

        await AsyncStorage.setItem("user_id", data.user.id);

        await fetchAndSaveSubjects(data.token)
        console.log("TOKEN SAVED", data.token);
        console.log("USER ID SAVED", data.user.id);

        Alert.alert('Success', 'Login successful!');
        navigation.navigate('Diversionscreen');
      } else {
        Alert.alert('Invalid Credentials', data.message || 'Try again.');
      }

    } catch (error) {
      console.log("LOGIN ERROR", error)
      Alert.alert('Error', 'Something went wrong. Try later.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Email / Phone Input */}
        <View
          style={[
            styles.inputContainer,
            {
              borderWidth: errorFields.email ? 1.5 : 0,
              borderColor: errorFields.email ? 'red' : 'transparent',
            },
          ]}>
          <Icon name="mail" size={20} color="#000" style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Email / Phone no."
            placeholderTextColor="#999"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (text.trim() !== '')
                setErrorFields(prev => ({ ...prev, email: false }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View
          style={[
            styles.inputContainer,
            {
              borderWidth: errorFields.password ? 1.5 : 0,
              borderColor: errorFields.password ? 'red' : 'transparent',
            },
          ]}>
          <Icon name="bag" size={20} color="#000" style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (text.trim() !== '')
                setErrorFields(prev => ({ ...prev, password: false }));
            }}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}>
            <Icon
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.canceltext}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: '40%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 16,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000CC',
    marginLeft: 10,
  },
  leftIcon: {
    marginRight: 5,
  },
  rightIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#1A3848',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  canceltext: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default LoginDetail;
