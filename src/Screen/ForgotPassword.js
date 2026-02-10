import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotPassword = ({ navigation }) => {

  // step: 1 = email | 2 = otp | 3 = new password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /* =========================
     STEP 1 : SEND OTP
  ========================= */
  const sendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter email');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/auth/password-reset/request',
        { email }
      );

      if (res.data.success) {
        Alert.alert('OTP Sent', 'Check your email');
        setStep(2);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to send OTP');
      }
    } catch (e) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STEP 2 : VERIFY OTP
  ========================= */
  const verifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Required', 'Enter OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/auth/password-reset/verify',
        { email, otp }
      );

      if (res.data.success) {
        Alert.alert('Verified', 'OTP verified successfully');
        setStep(3);
      } else {
        Alert.alert('Invalid OTP', res.data.message || 'Wrong OTP');
      }
    } catch (e) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STEP 3 : UPDATE PASSWORD
  ========================= */
  const updatePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Required', 'Enter new password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'https://fornix-medical.vercel.app/api/v1/auth/password-reset/update',
        {
          email,
          otp,
          new_password: newPassword,
        }
      );

      if (res.data.success) {
        Alert.alert('Success', 'Password updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', res.data.message || 'Update failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {step === 1 && 'Forgot Password'}
        {step === 2 && 'Verify OTP'}
        {step === 3 && 'Set New Password'}
      </Text>

      {/* EMAIL INPUT */}
      {step === 1 && (
        <>
          <View style={styles.inputBox}>
            <Icon name="mail-outline" size={20} color="#000" />
            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#999"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            {loading ? <ActivityIndicator color="#fff" /> :
              <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      )}

      {/* OTP INPUT */}
      {step === 2 && (
        <>
          <View style={styles.inputBox}>
            <Icon name="key-outline" size={20} color="#000" />
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#999"
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            {loading ? <ActivityIndicator color="#fff" /> :
              <Text style={styles.btnText}>Verify OTP</Text>}
          </TouchableOpacity>
        </>
      )}

      {/* NEW PASSWORD */}
      {step === 3 && (
        <>
          <View style={styles.inputBox}>
            <Icon name="lock-closed-outline" size={20} color="#000" />
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#999"
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={updatePassword}>
            {loading ? <ActivityIndicator color="#fff" /> :
              <Text style={styles.btnText}>Update Password</Text>}
          </TouchableOpacity>
        </>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 20,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#1A3848',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ForgotPassword;
