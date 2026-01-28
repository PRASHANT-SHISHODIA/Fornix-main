import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  PermissionsAndroid,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const { width, height } = Dimensions.get('window');

// 🔹 Responsive scaling functions
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 🔹 Responsive size function based on screen width
const getResponsiveSize = (size) => {
  if (width < 375) { // Small phones
    return size * 0.85;
  } else if (width > 414) { // Large phones
    return size * 1.15;
  }
  return size; // Normal phones
};

const Profile = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [avatarSource, setAvatarSource] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileImageUri = profileData?.profile_picture;


  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'edit',
      onPress: () => navigation.navigate('Editprofile',{
        data:profileData,
      })
    },
    //  {
    //   id: '2',
    //   title: 'Results',
    //   icon: 'score',
    //   onPress: () => navigation.navigate('Results')
    // },

    {
      id: '3',
      title: 'Portfolio',
      icon: 'briefcase',
      onPress: () => navigation.navigate('Portfolio')
    },
    {
      id: '4',
      title: 'Chances To Pass',
      icon: 'chart-line',
      onPress: () => navigation.navigate('ChancesToPass')
    },
    {
      id: '5',
      title: 'History',
      icon: 'history',
      onPress: () => navigation.navigate('History')
    },
    {
      id: '6',
      title: 'Reset The Course',
      icon: 'refresh',
      onPress: () => showResetConfirmation()
    },
    {
      id: '7',
      title: 'Refer',
      icon: 'user-plus',
      onPress: () => navigation.navigate('Refer')
    },
    
    {
      id: '8',
      title: 'Logout',
      icon: 'sign-out-alt',
      onPress: () => showLogoutConfirmation()
    },
  ];


  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("user_id");

      if (!token || !userId) {
        Alert.alert("Session Expired", "Please Login again");
        navigation.replace("Logindetail");
        return;
      }
      const response = await axios.post(
        "https://fornix-medical.vercel.app/api/v1/user/get",
        {
          id: userId,

        },
        {


          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )
      console.log("PROFILE API RESPONSE:", response.data);
      setProfileData(response?.data?.user)

      // console.log(profileData)

    } catch (error) {
      console.log("PROFILE API ERROR", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showResetConfirmation = () => {
    Alert.alert(
      "Reset App",
      "Are you sure you want to reset all app data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => console.log("Reset app") }
      ]
    );
  };

    const handleLogout = async () =>{
    try{
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user_id");
      await AsyncStorage.removeItem("user");
      navigation.reset({
        index: 0,
        routes :[{name:"Logindetail"}],
      });
    }catch(error){
      console.log("LOGOUT ERROR", error.message);
      Alert.alert("Error","Failed to logout");
    }
   };

  const showLogoutConfirmation = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress:handleLogout }
      ]
    );
  };

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const handleImagePicker = () => {
    Alert.alert(
      "Select Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => openCamera(),
        },
        {
          text: "Choose from Gallery",
          onPress: () => openImageLibrary(),
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const openCamera = async () => {
    // Request camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
      cameraType: 'front',
      saveToPhotos: true, // Save to camera roll
    };

    launchCamera(options, (response) => {
      console.log('Camera Response:', response); // Debug log

      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        let errorMessage = 'Failed to take photo';
        switch (response.errorCode) {
          case 'camera_unavailable':
            errorMessage = 'Camera not available on this device';
            break;
          case 'permission':
            errorMessage = 'Camera permission denied';
            break;
          case 'others':
            errorMessage = response.errorMessage || 'Unknown camera error';
            break;
        }
        console.log('Camera Error: ', response.errorCode, response.errorMessage);
        Alert.alert('Camera Error', errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        setAvatarSource(source);
        console.log('Photo taken successfully:', source.uri);
      } else {
        console.log('Unexpected response:', response);
        Alert.alert('Error', 'Unexpected response from camera');
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
      selectionLimit: 1, // Only allow one image selection
    };

    launchImageLibrary(options, (response) => {
      console.log('Gallery Response:', response); // Debug log

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        let errorMessage = 'Failed to select image';
        switch (response.errorCode) {
          case 'permission':
            errorMessage = 'Photo library permission denied';
            break;
          case 'others':
            errorMessage = response.errorMessage || 'Unknown gallery error';
            break;
        }
        console.log('Gallery Error: ', response.errorCode, response.errorMessage);
        Alert.alert('Gallery Error', errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        setAvatarSource(source);
        console.log('Image selected successfully:', source.uri);
      } else {
        console.log('Unexpected response:', response);
        Alert.alert('Error', 'Unexpected response from gallery');
      }
    });
  };
 

   

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#F87F16" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon1 name="arrow-back" size={moderateScale(getResponsiveSize(24))} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} />
            ) : profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Icon name="user" size={moderateScale(getResponsiveSize(40))} color="#FFF" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
              <Icon1 name="camera" size={moderateScale(getResponsiveSize(16))} color="#F87F16" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profileData?.full_name}</Text>
          <Text style={styles.userEmail}>{profileData?.email}</Text>
          <Text style={styles.userRole}>{profileData?.role}</Text>
          {/* <TouchableOpacity>
            <Icon name="edit" size={25} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={moderateScale(getResponsiveSize(20))} color="#FFF" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>

              <View style={styles.menuRight}>
                <Icon1 name="chevron-forward" size={moderateScale(getResponsiveSize(20))} color="#FFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F87F16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(getResponsiveSize(20)),
    paddingVertical: verticalScale(getResponsiveSize(10)),
  },
  backButton: {
    padding: scale(getResponsiveSize(5)),
  },
  headerTitle: {
    fontSize: moderateScale(getResponsiveSize(22)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    includeFontPadding: false,
  },
  placeholder: {
    width: scale(getResponsiveSize(34)),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(getResponsiveSize(30)),
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(getResponsiveSize(20)),
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(getResponsiveSize(20)),
  },
  avatar: {
    width: scale(getResponsiveSize(100)),
    height: scale(getResponsiveSize(100)),
    borderRadius: scale(getResponsiveSize(50)),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarImage: {
    width: scale(getResponsiveSize(100)),
    height: scale(getResponsiveSize(100)),
    borderRadius: scale(getResponsiveSize(50)),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    width: scale(getResponsiveSize(32)),
    height: scale(getResponsiveSize(32)),
    borderRadius: scale(getResponsiveSize(16)),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F87F16',
  },
  userName: {
    fontSize: moderateScale(getResponsiveSize(20)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginBottom: verticalScale(getResponsiveSize(0)),
    textAlign: 'center',
    includeFontPadding: false,
  },
  userEmail: {
    fontSize: moderateScale(getResponsiveSize(13)),
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: verticalScale(getResponsiveSize(4)),
    textAlign: 'center',
    includeFontPadding: false,
  },
  userRole: {
    fontSize: moderateScale(getResponsiveSize(13)),
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  menuContainer: {
    paddingHorizontal: scale(getResponsiveSize(20)),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(getResponsiveSize(18)),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: scale(getResponsiveSize(40)),
    height: scale(getResponsiveSize(40)),
    borderRadius: scale(getResponsiveSize(20)),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(getResponsiveSize(15)),
  },
  menuTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: moderateScale(getResponsiveSize(16)),
    color: '#FFF',
    includeFontPadding: false,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(getResponsiveSize(30)),
  },
  versionText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    includeFontPadding: false,
  },
});

export default Profile;