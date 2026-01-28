import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon1 from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';

const { width, height } = Dimensions.get('window');

/* ---------- Responsive helpers ---------- */
const scale = s => (width / 375) * s;
const verticalScale = s => (height / 812) * s;
const moderateScale = (s, f = 0.5) => s + (scale(s) - s) * f;

/* ---------- Constants ---------- */
const API_BASE = 'https://fornix-medical.vercel.app/api/v1/mobile';
const RAZORPAY_KEY = 'rzp_test_4U2LJWfsmsYINp';

const CourseChoose = () => {
  const navigation = useNavigation();

  /* ---------- State ---------- */
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseForPlan, setSelectedCourseForPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [courseFeatures, setCourseFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  
  const [userData, setUserData] = useState(null);

  
const loadUserData = async () => {
  try {
    const data = await AsyncStorage.getItem('user_data');

    if (!data) {
      console.log('❌ No user_data found');
      return;
    }

    const parsed = JSON.parse(data);
    console.log('✅ Loaded user_data:', parsed);

    setUserData(parsed);
  } catch (e) {
    console.log('User data load error:', e);
  }
};



useEffect(() => {
  console.log('👤 userData in CourseChoose:', userData);
}, [userData]);




const getUserIdFromUserData = async () => {
  const data = await AsyncStorage.getItem('user_data');
  if (!data) return null;
  console.log("Data",data)

  const user = JSON.parse(data);
  return user.id; // 👈 YAHI user_id HAI

};

  

  /* ---------- Fetch courses ---------- */
  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`);
      if (res.data?.success) {
        const formatted = res.data.data.map((item, i) => ({
          ...item,
          color: ['#2C3E50', '#4A6491', '#2980B9', '#1A5276', '#34495E'][i % 5],
          secondaryColor: ['#3498DB', '#5DADE2', '#3498DB', '#2C3E50', '#7FB3D5'][i % 5],
        }));
        setCourses(formatted);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- Fetch course features ---------- */
  const fetchCourseFeatures = useCallback(async (courseId) => {
    try {
      setLoadingFeatures(true);
      const res = await axios.post(`${API_BASE}/course-features`, {
        course_id: courseId
      });
      
      if (res.data?.success) {
        setCourseFeatures(res.data.data || []);
      } else {
        setCourseFeatures([]);
      }
    } catch (e) {
      console.log('Features fetch error', e);
      setCourseFeatures([]);
    } finally {
      setLoadingFeatures(false);
    }
  }, []);

  /* ---------- Course selection ---------- */
  const handleCourseSelect = async (course) => {
    setSelectedCourse(course.id);
    setSelectedCourseForPlan(course);
    
    // Pehle features fetch karo aur modal dikhao
    await fetchCourseFeatures(course.id);
    setShowFeaturesModal(true);
  };

  /* ---------- Features modal se aage badho ---------- */
  const handleFeaturesModalProceed = useCallback(() => {
    setShowFeaturesModal(false);
    
    // Check if course has plans
    if (selectedCourseForPlan?.plans?.length > 0) {
      setSelectedPlan(null);
      setTimeout(() => {
        setShowPlanModal(true);
      }, 300);
    } else {
      navigateFree(selectedCourseForPlan);
    }
  }, [selectedCourseForPlan]);

  const navigateFree = (course) => {
    saveCourseSelection(course, null);
    navigation.navigate('TabNavigation', {
      courseId: course.id,
      courseName: course.name,
      paymentStatus: 'not_required',
    });
  };

  /* ---------- Payment and Enrollment ---------- */
  const enrollUser = async (paymentData, plan) => {
    console.log("payment data",paymentData,plan,userData.id,selectedCourseForPlan)
    const payload = {
      user_id: userData.id,
      course_id: selectedCourseForPlan.id,
      plan_id: plan.id,
      amount: plan.price,
      tax_amount: 0,
      transaction_mode: 'upi',
      transaction_id: paymentData.razorpay_payment_id,
      transaction_status: 'success',
      payment_date: new Date().toISOString(),
      start_date: new Date().toISOString(),
    };
    console.log('Payload',payload)

    const res = await axios.post(`${API_BASE}/enroll`, payload);
    
    return res.data?.success;
  };

  const startRazorpayPayment = async () => {
  if (!selectedPlan) {
    Alert.alert('Select Plan', 'Please select a plan first');
    return;
  }

  setProcessingPayment(true);

  const options = {
    key: RAZORPAY_KEY,
    amount: Number(selectedPlan.price) * 100, // VERY IMPORTANT
    currency: 'INR',
    name: 'Fornix Medical',
    description: `${selectedCourseForPlan.name} - ${selectedPlan.name}`,
    prefill: {
      email: userData?.email || 'test@gmail.com',
      contact: userData?.phone || '9999999999',
      name: userData?.name || 'User',
    },
    theme: { color: '#F87F16' },
  };

  try {
    const paymentData = await RazorpayCheckout.open(options);
    console.log('Payment Success:', paymentData);

    await handlePaymentSuccess(paymentData);
  } catch (error) {
    console.log('Payment Failed:', error);
    Alert.alert('Payment Cancelled', 'Payment was not completed');
  } finally {
    setProcessingPayment(false);
  }
};
const handlePaymentSuccess = async (paymentData) => {
  try {
    const enrolled = await enrollUser(paymentData, selectedPlan);
    console.log('Enrollment Response:', enrolled);

    // if (!enrolled) {
    //   Alert.alert(
    //     'Payment Done',
    //     'Payment successful but enrollment failed. Please contact support.'
    //   );
    //   return;
    // }

    await saveCourseSelection(selectedCourseForPlan, selectedPlan);

    Alert.alert('Success', 'Enrollment successful 🎉', [
      {
        text: 'OK',
        onPress: () => navigation.replace('TabNavigation'),
      },
    ]);
  } catch (error) {
    console.log('Post Payment Error:', error);
    Alert.alert(
      'Error',
      'Payment was successful but something went wrong. Contact support.'
    );
  }
};

  

  const handlePlanSelect = useCallback((plan) => {
    setSelectedPlan(plan);
  }, []);

  const handleProceedWithoutPlan = useCallback(() => {
    saveCourseSelection(selectedCourseForPlan, null);
    setShowPlanModal(false);
    
    navigation.navigate('TabNavigation', {
      courseId: selectedCourseForPlan.id,
      courseName: selectedCourseForPlan.name,
      paymentStatus: 'not_required',
    });
  }, [ selectedCourseForPlan]);

  /* ---------- Save selection ---------- */
  const saveCourseSelection = async (course, plan) => {
    try {
      const data = {
        courseId: course.id,
        courseName: course.name,
        planId: plan?.id || null,
        planName: plan?.name || null,
        planPrice: plan?.price || null,
        paymentStatus: plan ? 'paid' : 'not_required',
        enrolledAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('selectedCourse', JSON.stringify(data));
    } catch (error) {
      console.log('save error', error);
    } finally {
      setShowPlanModal(false);
    }
  };

  /* ---------- Render Course Feature Item ---------- */
  const renderFeatureItem = ({ item, index }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Text style={styles.featureNumber}>{index + 1}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{item.title || `Feature ${index + 1}`}</Text>
        <Text style={styles.featureDescription}>
          {item.description || 'No description available'}
        </Text>
        
        {item.sub_features && item.sub_features.length > 0 && (
          <View style={styles.subFeaturesContainer}>
            {item.sub_features.map((sub, subIndex) => (
              <View key={subIndex} style={styles.subFeature}>
                <Icon1 name="chevron-forward" size={14} color="#F87F16" />
                <Text style={styles.subFeatureText}>{sub}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  /* ---------- Features Modal Component ---------- */
  const FeaturesModal = () => (
    <Modal
      visible={showFeaturesModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => !processingPayment && setShowFeaturesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {selectedCourseForPlan?.name} Features
              </Text>
              <Text style={styles.modalSubtitle}>
                Explore what you'll learn in this course
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFeaturesModal(false)}
              style={styles.closeButton}
            >
              <Icon1 name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {loadingFeatures ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F87F16" />
              <Text style={styles.loadingText}>Loading features...</Text>
            </View>
          ) : courseFeatures.length > 0 ? (
            <FlatList
              data={courseFeatures}
              renderItem={renderFeatureItem}
              keyExtractor={(item, index) => `feature-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.featuresList}
            />
          ) : (
            <View style={styles.noFeaturesContainer}>
              <Icon1 name="information-circle" size={60} color="#BDC3C7" />
              <Text style={styles.noFeaturesText}>No features available</Text>
              <Text style={styles.noFeaturesSubtext}>
                This course doesn't have detailed features listed yet.
              </Text>
            </View>
          )}

          <View style={styles.featuresModalFooter}>
            <TouchableOpacity
              style={styles.cancelFeaturesButton}
              onPress={() => setShowFeaturesModal(false)}
            >
              <Text style={styles.cancelFeaturesText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.proceedFeaturesButton}
              onPress={handleFeaturesModalProceed}
            >
              <Text style={styles.proceedFeaturesText}>
                {selectedCourseForPlan?.plans?.length > 0 
                  ? 'View Plans & Pricing' 
                  : 'Continue Free Access'}
              </Text>
              <Icon1 name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /* ---------- Plan Selection Modal ---------- */
  const PlanSelectionModal = () => (
    <Modal
      visible={showPlanModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => !processingPayment && setShowPlanModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select Plan for {selectedCourseForPlan?.name}
            </Text>
            {!processingPayment && (
              <TouchableOpacity
                onPress={() => setShowPlanModal(false)}
                style={styles.closeButton}
                disabled={processingPayment}
              >
                <Icon1 name="close" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </View>

          {processingPayment ? (
            <View style={styles.paymentProcessingContainer}>
              <ActivityIndicator size="large" color="#F87F16" />
              <Text style={styles.paymentProcessingText}>
                Processing Payment...
              </Text>
              <Text style={styles.paymentSubText}>
                Please wait while we connect to payment gateway
              </Text>
            </View>
          ) : selectedCourseForPlan?.plans?.length > 0 ? (
            <FlatList
              data={selectedCourseForPlan.plans}
              renderItem={renderPlanItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.plansList}
              ListFooterComponent={
                <View style={styles.modalFooterButtons}>
                  <TouchableOpacity
                    style={styles.proceedWithoutPlanButton}
                    onPress={handleProceedWithoutPlan}
                  >
                    <Text style={styles.proceedWithoutPlanText}>
                      Continue Without Plan (Free)
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          ) : (
            <View style={styles.noPlansContainer}>
              <Text style={styles.noPlansText}>No plans available</Text>
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => {
                  saveCourseSelection(selectedCourseForPlan, null);
                  navigation.navigate('TabNavigation', {
                    courseId: selectedCourseForPlan.id,
                    courseName: selectedCourseForPlan.name,
                    paymentStatus: 'not_required',
                  });
                  setShowPlanModal(false);
                }}
              >
                <Text style={styles.proceedButtonText}>
                  Continue with Free Access
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedCourseForPlan?.plans?.length > 0 && !processingPayment && (
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedPlan && styles.disabledContinueButton
              ]}
              onPress={startRazorpayPayment}
              disabled={!selectedPlan}
            >
              <Text style={styles.continueButtonText}>
                {selectedPlan ? ` Enroll & Pay ₹${selectedPlan.price}` : 'Select a Plan'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  /* ---------- Render Plan Item (same as before) ---------- */
  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.planItem,
        selectedPlan?.id === item.id && styles.selectedPlanItem,
      ]}
      onPress={() => handlePlanSelect(item)}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{item.name}</Text>
        {item.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.originalPrice}>₹{item.original_price}</Text>
        <Text style={styles.currentPrice}>₹{item.price}</Text>
        {item.discount_price && (
          <Text style={styles.discountText}>{item.discount_price}% OFF</Text>
        )}
      </View>

      <Text style={styles.planDescription}>{item.description}</Text>

      <Text style={styles.durationText}>
        Duration: {item.duration_in_days} days
        {item.trial_days > 0 && ` | Trial: ${item.trial_days} days`}
      </Text>

      {item.features_list && item.features_list.length > 0 && (
        <View style={styles.featuresContainer}>
          {item.features_list.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon1 name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.accessFeaturesContainer}>
        <Text style={styles.accessTitle}>Access Includes:</Text>
        <View style={styles.accessFeaturesRow}>
          {item.access_features?.notes && (
            <View style={styles.accessFeature}>
              <Icon1 name="document-text" size={14} color="#3498DB" />
              <Text style={styles.accessText}>Notes</Text>
            </View>
          )}
          {item.access_features?.tests && (
            <View style={styles.accessFeature}>
              <Icon1 name="apps" size={14} color="#E74C3C" />
              <Text style={styles.accessText}>Tests</Text>
            </View>
          )}
          {item.access_features?.videos && (
            <View style={styles.accessFeature}>
              <Icon1 name="play-circle" size={14} color="#9B59B6" />
              <Text style={styles.accessText}>Videos</Text>
            </View>
          )}
          {item.access_features?.ai_explanation && (
            <View style={styles.accessFeature}>
              <Icon1 name="sparkles" size={14} color="#F39C12" />
              <Text style={styles.accessText}>AI Explain</Text>
            </View>
          )}
        </View>
      </View>

      {selectedPlan?.id === item.id && (
        <View style={styles.selectedPlanIndicator}>
          <Text style={styles.selectedPlanText}>Selected ✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchCourses();
    loadUserData()
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#F87F16" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Icon1 name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Select Your Program</Text>
            </View>
          </View>
        </View>

        <View style={styles.coursesContainer}>
          <Text style={styles.sectionTitle}>Available Courses</Text>

          {courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No courses available</Text>
            </View>
          ) : (
            courses.map(course => {
              const isSelected = selectedCourse === course.id;
              const hasPlans = course.plans && course.plans.length > 0;

              return (
                <TouchableOpacity
                  key={course.id}
                  activeOpacity={0.8}
                  onPress={() => handleCourseSelect(course)}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: course.color,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: '#FFF',
                    },
                  ]}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.courseIcon}>
                      <Text style={styles.courseIconText}>
                        {course.name.charAt(0)}
                      </Text>
                    </View>

                    <View style={styles.courseInfo}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseDescription}>
                        {course.description || 'Medical Entrance Preparation'}
                      </Text>
                      <View style={styles.courseDetails}>
                        <View style={styles.plansInfo}>
                          {hasPlans ? (
                            <>
                              <Icon1 name="layers" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.plansText}>
                                {course.plans.length} Plan{course.plans.length !== 1 ? 's' : ''} Available
                              </Text>
                            </>
                          ) : (
                            <>
                              <Icon1 name="school" size={14} color="rgba(255,255,255,0.7)" />
                              <Text style={styles.plansText}>Free Access</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIcon}>✓</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.colorBar,
                      { backgroundColor: course.secondaryColor },
                    ]}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {selectedCourse && (
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              Selected: {courses.find(c => c.id === selectedCourse)?.name}
            </Text>
            {selectedPlan && (
              <Text style={styles.planInfoText}>
                Plan: {selectedPlan?.name} - ₹{selectedPlan?.price}
              </Text>
            )}
            {userData ? (
              <Text style={styles.userInfoText}>
                Logged in as: {userData.name}
              </Text>
            ) : (
              <Text style={styles.loginPromptText}>
                Please login to make payment
              </Text>
            )}
            <Text style={styles.selectionHint}>
              {selectedPlan
                ? 'Click "Pay" button to make payment'
                : 'Select a plan or continue with free access'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FeaturesModal />
      <PlanSelectionModal />
    </SafeAreaView>
  );
};

export default CourseChoose;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#1F3A4D',
    fontWeight: '600',
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },

  header: {
    backgroundColor: '#F87F16',
    height: verticalScale(170),
    borderBottomLeftRadius: scale(400),
    borderBottomRightRadius: scale(400),
    transform: [{ scaleX: width < 375 ? 1.5 : width > 414 ? 1.8 : 1.7 }],
    marginBottom: verticalScale(30),
  },
  searchContainer: {
    paddingHorizontal: scale(50),
    paddingTop: verticalScale(60),
    transform: [{ scaleX: width < 375 ? 0.65 : width > 414 ? 0.55 : 0.58 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: -30,
  },
  title: {
    fontSize: moderateScale(24),
    color: '#FFF',
    fontWeight: '600',
  },

  coursesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F3A4D',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },

  courseCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFB703',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  courseIconText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  courseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plansInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  plansText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 5,
  },
  selectedIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF8A00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorBar: {
    height: 5,
    width: '100%',
  },

  selectionInfo: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8A00',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F3A4D',
  },
  planInfoText: {
    fontSize: 14,
    color: '#2E86C1',
    fontWeight: '600',
    marginTop: 4,
  },
  userInfoText: {
    fontSize: 12,
    color: '#27AE60',
    marginTop: 4,
  },
  loginPromptText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  selectionHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  /* ---------- Modal Styles ---------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F3A4D',
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
  },
  
  /* ---------- Features Modal Styles ---------- */
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F87F16',
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F87F16',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3A4D',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
    marginBottom: 8,
  },
  subFeaturesContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  subFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subFeatureText: {
    fontSize: 13,
    color: '#34495E',
    marginLeft: 6,
  },
  noFeaturesContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noFeaturesText: {
    fontSize: 16,
    color: '#95A5A6',
    marginTop: 12,
    fontWeight: '600',
  },
  noFeaturesSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 8,
  },
  featuresModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelFeaturesButton: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelFeaturesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  proceedFeaturesButton: {
    flex: 2,
    backgroundColor: '#F87F16',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  proceedFeaturesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 6,
  },
  
  /* ---------- Plan Modal Styles ---------- */
  plansList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  modalFooterButtons: {
    marginTop: 20,
  },

  paymentProcessingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentProcessingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3A4D',
    marginTop: 20,
    marginBottom: 10,
  },
  paymentSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  planItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanItem: {
    borderColor: '#F87F16',
    backgroundColor: '#FFF3E0',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F3A4D',
  },
  popularBadge: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#95A5A6',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2ECC71',
    marginRight: 10,
  },
  discountText: {
    fontSize: 12,
    color: '#E74C3C',
    backgroundColor: '#FDEDEC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featureText: {
    fontSize: 13,
    color: '#2C3E50',
    marginLeft: 6,
  },
  accessFeaturesContainer: {
    marginBottom: 12,
  },
  accessTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  accessFeaturesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accessFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  accessText: {
    fontSize: 12,
    color: '#2C3E50',
    marginLeft: 4,
  },
  selectedPlanIndicator: {
    backgroundColor: '#27AE60',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  selectedPlanText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noPlansContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noPlansText: {
    fontSize: 16,
    color: '#95A5A6',
    marginBottom: 20,
  },
  proceedButton: {
    backgroundColor: '#F87F16',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  proceedWithoutPlanButton: {
    backgroundColor: '#95A5A6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedWithoutPlanText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#F87F16',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  disabledContinueButton: {
    backgroundColor: '#CCD1D1',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});