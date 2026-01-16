import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon1 from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

/* 🔹 Responsive helpers */
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const CourseChoose = () => {
  const navigation = useNavigation();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedCourseForPlan, setSelectedCourseForPlan] = useState(null);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://fornix-medical.vercel.app/api/v1/mobile/courses');
      
      if (response?.data?.success) {
        const formattedCourses = response.data.data.map((item, index) => ({
          ...item,
          uiId: index + 1,
          color: ['#2C3E50', '#4A6491', '#2980B9', '#1A5276', '#34495E'][index % 5],
          secondaryColor: ['#3498DB', '#5DADE2', '#3498DB', '#2C3E50', '#7FB3D5'][index % 5],
        }));
        setCourses(formattedCourses);
      } else {
        Alert.alert("Error", "Failed to fetch courses");
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("ERROR", "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course.id);
    
    // Agar course ke plans hain toh plan selection modal show karo
    if (course.plans && course.plans.length > 0) {
      setSelectedCourseForPlan(course);
      setShowPlanModal(true);
    } else {
      // Agar plans nahi hain, directly save karo
      saveCourseSelection(course, null);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    saveCourseSelection(selectedCourseForPlan, plan);
    setShowPlanModal(false);
  };

  const handleNoPlanSelection = (course) => {
    setSelectedPlan(null);
    saveCourseSelection(course, null);
  };

  const handleMakePayment = (plan) => {
    navigation.navigate('Review', {
      courseName: selectedCourseForPlan.name,
      price: plan.price,
      planType: plan.type,
      subtitle: plan.description,
      icon: 'graduation-cap',
      color: selectedCourseForPlan.color,
      features: plan.access_features
    });
  };
  console.log("Selected Plan for Payment:", selectedPlan);

  const saveCourseSelection = async (course, plan) => {
    try {
      const selectedData = {
        courseId: course.id,
        courseName: course.name,
        planId: plan?.id || null,
        planName: plan?.name || null,
        planPrice: plan?.price || null,
        planFeatures: plan?.access_features || null,
      };

      // ✅ save in AsyncStorage
      await AsyncStorage.setItem('selectedCourse', JSON.stringify(selectedData));

      console.log('Selected Course:', course.name);
      console.log('Selected Plan:', plan?.name || 'No Plan');
      console.log('Plan Price:', plan?.price || 'N/A');
      console.log('Plan Features:', plan?.access_features || {});

      // ✅ pass via navigation
      navigation.navigate('TabNavigation', {
        courseId: course.id,
        courseName: course.name,
        planId: plan?.id,
        planName: plan?.name,
        planPrice: plan?.price,
      });

    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Selection failed");
    }
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.planItem,
        selectedPlan === item.id && styles.selectedPlanItem,
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
      
      {/* Features List */}
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
      
      {/* Access Features */}
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
      
      {selectedPlan === item.id && (
        <View style={styles.selectedPlanIndicator}>
          <Text style={styles.selectedPlanText}>Selected ✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const PlanSelectionModal = () => (
    <Modal
      visible={showPlanModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPlanModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select Plan for {selectedCourseForPlan?.name}
            </Text>
            <TouchableOpacity
              onPress={() => setShowPlanModal(false)}
              style={styles.closeButton}
            >
              <Icon1 name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {selectedCourseForPlan?.plans?.length > 0 ? (
            <FlatList
              data={selectedCourseForPlan.plans}
              renderItem={renderPlanItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.plansList}
            />
          ) : (
            <View style={styles.noPlansContainer}>
              <Text style={styles.noPlansText}>No plans available</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (selectedPlan) {
                setShowPlanModal(false);
                handleMakePayment(selectedPlan);
                
              } else {
                Alert.alert("Select Plan", "Please select a plan to continue");
              }
            }}
          >
            <Text style={styles.continueButtonText}>
              {selectedPlan ? 'Continue with Selected Plan' : 'Select a Plan to Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
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
        {/* 🔶 Header */}
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

        {/* 🔶 Courses */}
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
                              <Icon1 name="information-circle" size={14} color="rgba(255,255,255,0.7)" />
                              <Text style={styles.plansText}>No Plans Available</Text>
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

        {/* 🔶 Selected Info */}
        {selectedCourse && (
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              Selected: {courses.find(c => c.id === selectedCourse)?.name}
            </Text>
            {selectedPlan && (
              <Text style={styles.planInfoText}>
                Plan: {selectedCourseForPlan?.plans?.find(p => p.id === selectedPlan)?.name}
              </Text>
            )}
            <Text style={styles.selectionHint}>
              {selectedPlan 
                ? 'You will be redirected to home screen' 
                : 'Select a plan to continue'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Plan Selection Modal */}
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
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },

  /* Header Styles */
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

  /* Courses Container */
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

  /* Course Card */
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

  /* Selection Info */
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
  selectionHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  closeButton: {
    padding: 5,
  },
  plansList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  /* Plan Item Styles */
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});