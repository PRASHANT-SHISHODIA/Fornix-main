import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  if (width < 375) return 1.5;
  if (width > 414) return 1.7;
  return 1.6;
};

const getSearchTransform = () => {
  if (width < 375) return 0.65;
  if (width > 414) return 0.6;
  return 0.62;
};

const Review = ({ route }) => {
//  const {courseName, price, planType, icon, color} = route.
//  params;
 const {
    courseName = '',
    price = 0,
    planType = 'monthly',
    icon = 'graduation-cap',
    color = '#F87F16',
  } = route?.params || {};

  console.log('Review Screen Params:', route?.params);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [savedCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/24' },
    { id: 2, type: 'MasterCard', last4: '8888', expiry: '08/25' }
  ]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const paymentMethods = [
    { 
      id: 'card', 
      title: 'Credit / Debit Card', 
      icon: 'credit-card',
      description: 'Pay securely with your card',
      color: '#4CAF50'
    },
    { 
      id: 'paypal', 
      title: 'PayPal', 
      icon: 'paypal',
      description: 'Pay with your PayPal account',
      color: '#003087'
    },
    { 
      id: 'upi', 
      title: 'UPI / GPay', 
      icon: 'mobile-alt',
      description: 'Instant payment with UPI',
      color: '#5F259F'
    },
    { 
      id: 'netbanking', 
      title: 'Net Banking', 
      icon: 'university',
      description: 'Direct bank transfer',
      color: '#2196F3'
    }
  ];

  const handlePay = () => {
    if (!paymentMethod) {
      Alert.alert(
        'Select Payment Method',
        'Please choose a payment method to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('Successful', {
      paymentMethod,
      courseName,
      price,
      planType,
      icon,
      color
    });
  };
  

  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    return `₹${price}`;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <LinearGradient
        colors={['#F87F16', '#FF9800']}
        style={[
          styles.header,
          {
            height: verticalScale(getResponsiveSize(160)),
            borderBottomLeftRadius: scale(300),
            borderBottomRightRadius: scale(300),
            transform: [{ scaleX: getHeaderTransform() }],
          }
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Review Order</Text>
            <Text style={styles.headerSubtitle}>Confirm your purchase</Text>
          </View>
          
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="question-circle" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={[styles.courseIcon, { backgroundColor: `${color}15` }]}>
              <Icon name={icon || 'graduation-cap'} size={24} color={color || '#F87F16'} />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{courseName}</Text>
              <Text style={styles.coursePlan}>{planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Order Details */}
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subscription</Text>
              <Text style={styles.detailValue}>{planType === 'monthly' ? '1 Month' : '1 Year'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Billing Cycle</Text>
              <Text style={styles.detailValue}>
                {planType === 'monthly' ? 'Monthly' : 'Yearly'} auto-renewal
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Access Includes</Text>
              <Text style={styles.detailValue}>Full course materials</Text>
            </View>

            {planType === 'yearly' && (
              <View style={styles.savingsBadge}>
                <Icon name="crown" size={14} color="#FFD700" />
                <Text style={styles.savingsText}>You save 49% with yearly plan</Text>
              </View>
            )}
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>{formatPrice(price)}</Text>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                paymentMethod === method.id && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodHeader}>
                <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                  <Icon name={method.icon} size={18} color="white" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>{method.title}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected
                ]}>
                  {paymentMethod === method.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Saved Cards (if card selected) */}
          {paymentMethod === 'card' && (
            <View style={styles.savedCardsContainer}>
              <Text style={styles.savedCardsTitle}>Saved Cards</Text>
              {savedCards.map(card => (
                <TouchableOpacity key={card.id} style={styles.cardItem}>
                  <Icon name={card.type.toLowerCase()} size={24} color="#4CAF50" />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardType}>{card.type}</Text>
                    <Text style={styles.cardNumber}>•••• {card.last4}</Text>
                  </View>
                  <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addCardButton}>
                <Icon name="plus-circle" size={16} color="#F87F16" />
                <Text style={styles.addCardText}>Add New Card</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Security & Benefits */}
        <View style={styles.securityContainer}>
          <View style={styles.securityRow}>
            <Icon name="shield-alt" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>Secure SSL encrypted payment</Text>
          </View>
          <View style={styles.securityRow}>
            <Icon name="lock" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>Your data is 100% protected</Text>
          </View>
          <View style={styles.securityRow}>
            <Icon name="undo" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>30-day money-back guarantee</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceSummary}>
          <Text style={styles.finalAmount}>{formatPrice(price)}</Text>
          <Text style={styles.taxText}>Including all taxes</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.payButton,
            !paymentMethod && styles.payButtonDisabled
          ]}
          onPress={handlePay}
          disabled={!paymentMethod}
        >
          <LinearGradient
            colors={paymentMethod ? ['#F87F16', '#FF9800'] : ['#CCCCCC', '#AAAAAA']}
            style={styles.payButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.payButtonContent}>
              <Icon name="lock" size={16} color="white" />
              <Text style={styles.payButtonText}>
                {paymentMethod ? `Pay ${formatPrice(price)} Securely` : 'Select Payment Method'}
              </Text>
              <Icon name="arrow-right" size={16} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Review;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: scale(getResponsiveSize(16)),
    paddingBottom: verticalScale(100),
  },
  header: {
    paddingHorizontal: scale(getResponsiveSize(20)),
    paddingBottom: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: verticalScale(40),
    transform: [{ scaleX: 0.8 }],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft :30,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: moderateScale(getResponsiveSize(22)),
    fontFamily: 'Poppins-Bold',
    color: 'white',
    textAlign: 'center',
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
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:30,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  courseIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: moderateScale(getResponsiveSize(20)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    includeFontPadding: false,
  },
  coursePlan: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginTop: 2,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: verticalScale(15),
  },
  orderDetails: {
    marginBottom: verticalScale(15),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  detailLabel: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#666',
    includeFontPadding: false,
  },
  detailValue: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    includeFontPadding: false,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
    marginTop: verticalScale(10),
  },
  savingsText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-SemiBold',
    color: '#B8860B',
    marginLeft: 6,
    includeFontPadding: false,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(15),
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    includeFontPadding: false,
  },
  totalPrice: {
    fontSize: moderateScale(getResponsiveSize(24)),
    fontFamily: 'Poppins-Bold',
    color: '#F87F16',
    includeFontPadding: false,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: moderateScale(getResponsiveSize(18)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    marginBottom: verticalScale(15),
    includeFontPadding: false,
  },
  paymentMethodCard: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginBottom: verticalScale(10),
    backgroundColor: '#F8F9FA',
  },
  paymentMethodSelected: {
    borderColor: '#F87F16',
    backgroundColor: 'rgba(248, 127, 22, 0.05)',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    includeFontPadding: false,
  },
  paymentDescription: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 2,
    includeFontPadding: false,
  },
  radioButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#CED4DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#F87F16',
  },
  radioInner: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#F87F16',
  },
  savedCardsContainer: {
    marginTop: verticalScale(15),
    paddingTop: verticalScale(15),
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  savedCardsTitle: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: verticalScale(10),
    includeFontPadding: false,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  cardInfo: {
    flex: 1,
    marginLeft: moderateScale(12),
  },
  cardType: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    includeFontPadding: false,
  },
  cardNumber: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    includeFontPadding: false,
  },
  cardExpiry: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Medium',
    color: '#888',
    includeFontPadding: false,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F87F16',
    borderStyle: 'dashed',
    borderRadius: moderateScale(10),
    marginTop: verticalScale(5),
  },
  addCardText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#F87F16',
    marginLeft: 8,
    includeFontPadding: false,
  },
  securityContainer: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  securityText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#4CAF50',
    marginLeft: 10,
    includeFontPadding: false,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingHorizontal: scale(getResponsiveSize(16)),
    paddingVertical: verticalScale(15),
    paddingBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  finalAmount: {
    fontSize: moderateScale(getResponsiveSize(24)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    includeFontPadding: false,
  },
  taxText: {
    fontSize: moderateScale(getResponsiveSize(12)),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    includeFontPadding: false,
  },
  payButton: {
    borderRadius: moderateScale(25),
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    paddingVertical: verticalScale(16),
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginHorizontal: 10,
    includeFontPadding: false,
  },
});