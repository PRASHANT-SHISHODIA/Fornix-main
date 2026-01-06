import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

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

const Successful = ({ route }) => {
  const { courseName, price, planType, paymentMethod, icon = 'graduation-cap', color = '#F87F16' } = route?.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Animations
  const [tickScale] = useState(new Animated.Value(0));
  const [giftScale] = useState(new Animated.Value(0));
  const [fadeIn] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animated sequence
    Animated.sequence([
      // Green tick animation
      Animated.spring(tickScale, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
        delay: 300,
      }),
      // Fade in content
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Gift animation
      Animated.spring(giftScale, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CourseChoose' }],
    });
  };

  const handleViewCourse = () => {
    navigation.navigate('CourseDetails', {
      courseName,
      planType,
      icon,
      color
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />

      {/* Green Header */}
      <LinearGradient
        colors={['#4CAF50', '#8BC34A']}
        style={styles.successHeader}
      >
        <Text style={styles.headerTitle}>Payment Successful!</Text>
        <Text style={styles.headerSubtitle}>Welcome to Fornix Medical</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Green Tick */}
        <View style={styles.tickContainer}>
          <Animated.View
            style={[
              styles.tickCircle,
              {
                transform: [{ scale: tickScale }],
              }
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#8BC34A']}
              style={styles.tickGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="check" size={moderateScale(50)} color="white" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.paymentDoneText}>Payment Done!</Text>
        </View>

        {/* Course Enrollment Details */}
        <Animated.View style={[styles.detailsCard, { opacity: fadeIn }]}>
          <Text style={styles.enrollmentTitle}>You're Enrolled In</Text>
          
          <View style={styles.courseInfo}>
            <View style={[styles.courseIcon, { backgroundColor: `${color}15` }]}>
              <Icon name={icon} size={24} color={color} />
            </View>
            <View style={styles.courseDetails}>
              <Text style={styles.courseName}>{courseName || 'NEET UG'}</Text>
              <Text style={styles.planType}>
                {planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Details */}
          <View style={styles.paymentDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.amount}>{price || '$299'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <View style={styles.paymentMethod}>
                <Icon 
                  name={
                    paymentMethod === 'card' ? 'credit-card' : 
                    paymentMethod === 'paypal' ? 'paypal' : 
                    'mobile-alt'
                  } 
                  size={16} 
                  color="#4CAF50" 
                />
                <Text style={styles.methodText}>
                  {paymentMethod === 'card' ? 'Credit Card' : 
                   paymentMethod === 'paypal' ? 'PayPal' : 
                   'UPI'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.transactionId}>TXN{Date.now().toString().slice(-8)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.dateTime}>
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Gift Section */}
        <Animated.View 
          style={[
            styles.giftCard,
            { 
              opacity: fadeIn,
              transform: [{ scale: giftScale }]
            }
          ]}
        >
          <View style={styles.giftHeader}>
            <Icon name="gift" size={24} color="#FF9800" />
            <Text style={styles.giftTitle}>🎁 Welcome Gift!</Text>
          </View>
          
          <Text style={styles.giftMessage}>
            As a thank you for enrolling, here's your special gift:
          </Text>
          
          <View style={styles.giftItems}>
            <View style={styles.giftItem}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.giftItemText}>7-Day Premium Access</Text>
            </View>
            
            <View style={styles.giftItem}>
              <Icon name="bolt" size={16} color="#4CAF50" />
              <Text style={styles.giftItemText}>Priority Support</Text>
            </View>
            
            <View style={styles.giftItem}>
              <Icon name="download" size={16} color="#2196F3" />
              <Text style={styles.giftItemText}>Extra Study Materials</Text>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View style={[styles.nextStepsCard, { opacity: fadeIn }]}>
          <Text style={styles.nextStepsTitle}>What happens next?</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Course access activated immediately</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Study materials available in dashboard</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Schedule your first learning session</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View style={[styles.buttonContainer, { opacity: fadeIn }]}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#8BC34A']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="home" size={20} color="white" />
            <Text style={styles.homeButtonText}>Go to Home Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.courseButton}
          onPress={handleViewCourse}
          activeOpacity={0.8}
        >
          <Icon name="book-open" size={20} color="#4CAF50" />
          <Text style={styles.courseButtonText}>View Course Details</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Successful;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  successHeader: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    paddingBottom: verticalScale(25),
  },
  headerTitle: {
    fontSize: moderateScale(getResponsiveSize(24)),
    fontFamily: 'Poppins-Bold',
    color: 'white',
    textAlign: 'center',
    marginTop: verticalScale(10),
    includeFontPadding: false,
  },
  headerSubtitle: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
    includeFontPadding: false,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(getResponsiveSize(16)),
    paddingBottom: verticalScale(120),
  },
  tickContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(20),
  },
  tickCircle: {
    width: moderateScale(getResponsiveSize(100)),
    height: moderateScale(getResponsiveSize(100)),
    borderRadius: moderateScale(getResponsiveSize(50)),
    marginBottom: verticalScale(15),
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  tickGradient: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(getResponsiveSize(50)),
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentDoneText: {
    fontSize: moderateScale(getResponsiveSize(20)),
    fontFamily: 'Poppins-Bold',
    color: '#4CAF50',
    includeFontPadding: false,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  enrollmentTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    textAlign: 'center',
    marginBottom: verticalScale(20),
    includeFontPadding: false,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  courseIcon: {
    width: moderateScale(getResponsiveSize(50)),
    height: moderateScale(getResponsiveSize(50)),
    borderRadius: moderateScale(getResponsiveSize(25)),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
  },
  courseDetails: {
    flex: 1,
  },
  courseName: {
    fontSize: moderateScale(getResponsiveSize(20)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    includeFontPadding: false,
  },
  planType: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginTop: 4,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: verticalScale(15),
  },
  paymentDetails: {
    marginTop: verticalScale(10),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    paddingVertical: verticalScale(8),
  },
  detailLabel: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    includeFontPadding: false,
  },
  amount: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: '#4CAF50',
    includeFontPadding: false,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginLeft: 8,
    includeFontPadding: false,
  },
  transactionId: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    includeFontPadding: false,
  },
  dateTime: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#333',
    includeFontPadding: false,
  },
  giftCard: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(15),
  },
  giftTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: '#FF9800',
    marginLeft: 10,
    includeFontPadding: false,
  },
  giftMessage: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(15),
    lineHeight: moderateScale(getResponsiveSize(20)),
    includeFontPadding: false,
  },
  giftItems: {
    marginTop: verticalScale(10),
  },
  giftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(8),
  },
  giftItemText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginLeft: 10,
    includeFontPadding: false,
  },
  nextStepsCard: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  nextStepsTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    textAlign: 'center',
    marginBottom: verticalScale(20),
    includeFontPadding: false,
  },
  stepsContainer: {
    marginTop: verticalScale(10),
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  stepNumber: {
    width: moderateScale(getResponsiveSize(30)),
    height: moderateScale(getResponsiveSize(30)),
    borderRadius: moderateScale(getResponsiveSize(15)),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
  },
  stepNumberText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Bold',
    color: '#4CAF50',
    includeFontPadding: false,
  },
  stepText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#333',
    flex: 1,
    includeFontPadding: false,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingHorizontal: scale(getResponsiveSize(16)),
    paddingVertical: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  homeButton: {
    borderRadius: moderateScale(25),
    overflow: 'hidden',
    marginBottom: verticalScale(12),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
  },
  homeButtonText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginLeft: 10,
    includeFontPadding: false,
  },
  courseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: moderateScale(25),
  },
  courseButtonText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#4CAF50',
    marginLeft: 10,
    includeFontPadding: false,
  },
});