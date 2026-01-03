import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import { launchImageLibrary } from "react-native-image-picker";



const {width} = Dimensions.get('window');

// Country data with high-quality flag images
const countries = [
  {
    code: 'US',
    name: 'United States',
    dial_code: '+1',
    flag: 'https://flagcdn.com/w320/us.png',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dial_code: '+44',
    flag: 'https://flagcdn.com/w320/gb.png',
  },
  {
    code: 'IN',
    name: 'India',
    dial_code: '+91',
    flag: 'https://flagcdn.com/w320/in.png',
  },
  {
    code: 'CA',
    name: 'Canada',
    dial_code: '+1',
    flag: 'https://flagcdn.com/w320/ca.png',
  },
  {
    code: 'AU',
    name: 'Australia',
    dial_code: '+61',
    flag: 'https://flagcdn.com/w320/au.png',
  },
  {
    code: 'DE',
    name: 'Germany',
    dial_code: '+49',
    flag: 'https://flagcdn.com/w320/de.png',
  },
  {
    code: 'FR',
    name: 'France',
    dial_code: '+33',
    flag: 'https://flagcdn.com/w320/fr.png',
  },
  {
    code: 'JP',
    name: 'Japan',
    dial_code: '+81',
    flag: 'https://flagcdn.com/w320/jp.png',
  },
  {
    code: 'CN',
    name: 'China',
    dial_code: '+86',
    flag: 'https://flagcdn.com/w320/cn.png',
  },
  {
    code: 'BR',
    name: 'Brazil',
    dial_code: '+55',
    flag: 'https://flagcdn.com/w320/br.png',
  },
  {
    code: 'MX',
    name: 'Mexico',
    dial_code: '+52',
    flag: 'https://flagcdn.com/w320/mx.png',
  },
  {
    code: 'RU',
    name: 'Russia',
    dial_code: '+7',
    flag: 'https://flagcdn.com/w320/ru.png',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dial_code: '+27',
    flag: 'https://flagcdn.com/w320/za.png',
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dial_code: '+234',
    flag: 'https://flagcdn.com/w320/ng.png',
  },
  {
    code: 'KR',
    name: 'South Korea',
    dial_code: '+82',
    flag: 'https://flagcdn.com/w320/kr.png',
  },
  {
    code: 'SG',
    name: 'Singapore',
    dial_code: '+65',
    flag: 'https://flagcdn.com/w320/sg.png',
  },
  {
    code: 'AE',
    name: 'UAE',
    dial_code: '+971',
    flag: 'https://flagcdn.com/w320/ae.png',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dial_code: '+966',
    flag: 'https://flagcdn.com/w320/sa.png',
  },
  {
    code: 'IT',
    name: 'Italy',
    dial_code: '+39',
    flag: 'https://flagcdn.com/w320/it.png',
  },
  {
    code: 'ES',
    name: 'Spain',
    dial_code: '+34',
    flag: 'https://flagcdn.com/w320/es.png',
  },
];

const Signupdetail = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // States for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Validation state
  const [errorFields, setErrorFields] = useState({
    email: false,
    password: false,
    phone: false,
    name: false,
  });

  // Dropdown States
  const [selectedCountry, setSelectedCountry] = useState(countries[2]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

  // Pick Image
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  // Toggle Password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle Country Dropdown
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Select Country
  const selectCountry = country => {
    setSelectedCountry(country);
    setDropdownVisible(false);
  };

  // Handle Submit
 const handleNext = async () => {
  const validationResult = {
    name: name.trim() === '', 
    email: !emailRegex.test(email),
    password: password.length < 6,
    phone: phoneNumber.trim().length !== 10,
  };

  setErrorFields(validationResult);

  if (Object.values(validationResult).includes(true)) {
    Alert.alert("Invalid Input", "Please correct the highlighted fields.");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phone", phoneNumber);

    if (selectedImage) {
      formData.append("profile_picture", {
        uri: selectedImage.uri,
        type: selectedImage.type || "image/jpeg",
        name: selectedImage.fileName || "profile.jpg",
      });
    } else {
      Alert.alert("Photo Required", "Please upload your profile picture.");
      setLoading(false);
      return;
    }

    const response = await axios.post(
      "https://fornix-medical.vercel.app/api/v1/auth/register",   // <-- replace with your backend URL
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response.data);

    Alert.alert("Success", "Account created successfully!");
    navigation.navigate("Diversionscreen");

  } catch (error) {
    console.log(error?.response?.data);

    Alert.alert(
      "Signup Failed",
      error.response?.data?.message || "Something went wrong."
    );
  }

  setLoading(false);
};



  // Render country item for dropdown
  const renderCountryItem = ({item}) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => selectCountry(item)}>
      <Image
        source={{uri: item.flag}}
        style={styles.countryFlag}
        resizeMode="cover"
      />
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.dialCode}>{item.dial_code}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Title */}
      <Text style={styles.title}>Create{'\n'}Account</Text>
     <TouchableOpacity onPress={pickImage}>
       <Image
        source={require('../assets/Images/UploadPhoto.png')}
        style={{height: 65, width: 65, marginBottom: 35}}
      />
     </TouchableOpacity>

      {/* Name Input */}
      <View
        style={[
          styles.inputContainer,
          {
            borderWidth: name.trim() === '' && errorFields.name ? 1.5 : 0,
            borderColor: errorFields.name ? 'red' : 'transparent',
          },
        ]}>
         <Icon
            name="person-outline"
            size={20}
            color="#000"
            style={styles.leftIcon}
          />
        <TextInput
          style={styles.textInput}
          placeholder="Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={text => {
            setName(text);
            if (text.trim() !== '')
              setErrorFields(prev => ({...prev, name: false}));
          }}
        />
      </View>

      {/* Email Input */}
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
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (text.trim() !== '')
              setErrorFields(prev => ({...prev, email: false}));
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
              setErrorFields(prev => ({...prev, password: false}));
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

      {/* Phone Number Input */}
      <View
        style={[
          styles.inputContainer,
          {
            borderWidth: errorFields.phone ? 1.5 : 0,
            borderColor: errorFields.phone ? 'red' : 'transparent',
          },
        ]}>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={toggleDropdown}>
          <Image
            source={{uri: selectedCountry.flag}}
            style={styles.flagIcon}
            resizeMode="cover"
          />
          <Text style={styles.dialCodeText}>{selectedCountry.dial_code}</Text>
          <Icon name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, styles.phoneInput]}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={text => {
            setPhoneNumber(text);
            if (text.trim() !== '')
              setErrorFields(prev => ({...prev, phone: false}));
          }}
        />
      </View>

      {/* Country Dropdown Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}>
          <View style={styles.dropdownContainer}>
            <FlatList
              data={countries}
              renderItem={renderCountryItem}
              keyExtractor={item => item.code}
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{loading ? "Please wait..." : "Sign Up"}</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export const  emailvalidation =( email) =>{
  if(!email){
    return "please enter your email"
  }
  if(!emailRegex.test(email)){
    return "please enter your valid email"
    
  }
  return '';

};

export const passwordValidation = (password)=>{
  if(!password){
    return "please enter your password"
  
  }
  if (!passwordRegex.test(password)){
    return " At least 1 uppercase , 1 digit, mai 6 char"
  }
  return ''
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginBottom: 15,
    paddingTop: 35,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 12,
    width: width - 48,
    marginBottom: 16,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#000000CC',
    marginLeft: 10,
  },
  phoneInput: {
    marginLeft: 0,
  },
  leftIcon: {
    marginRight: 5,
  },
  rightIcon: {
    padding: 5,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    marginRight: 10,
  },
  flagIcon: {
    width: 26,
    height: 20,
    marginRight: 8,
    borderRadius: 2,
  },
  dialCodeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#000000CC',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: width - 80,
    maxHeight: 400,
    padding: 10,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countryFlag: {
    width: 32,
    height: 24,
    marginRight: 12,
    borderRadius: 2,
  },
  countryName: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000CC',
  },
  dialCode: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#1A3848',
    borderRadius: 12,
    paddingVertical: 12,
    width: width - 48,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: 2,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
});

export default Signupdetail;
