// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/FontAwesome5';

// const { width } = Dimensions.get('window');
// const CARD_WIDTH = width * 0.9;

// const API_URL = 'https://fornix-medical.vercel.app/api/v1/mobile/courses';

// const PlansScreen = () => {
//   const [loading, setLoading] = useState(true);
//   const [plans, setPlans] = useState([]);

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const fetchPlans = async () => {
//     try {
//       const res = await axios.get(API_URL);

//       // 👉 AMC course filter
//       const amcCourse = res.data.data.find(
//         item => item.name.trim() === 'AMC'
//       );

//       if (amcCourse && amcCourse.plans) {
//         // priority_order ke according sort
//         const sortedPlans = amcCourse.plans.sort(
//           (a, b) => a.priority_order - b.priority_order
//         );
//         setPlans(sortedPlans);
//       }
//     } catch (error) {
//       console.log('API Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderPlan = ({ item }) => <PlanCard plan={item} />;

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#1A3848" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Choose Your Plan</Text>

//       <FlatList
//         data={plans}
//         keyExtractor={item => item.id}
//         renderItem={renderPlan}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//     </View>
//   );
// };

// /* ================= PLAN CARD ================= */

// const PlanCard = ({ plan }) => {
//   return (
//     <View style={[styles.card, plan.popular && styles.popularCard]}>
      
//       {plan.popular && (
//         <View style={styles.popularBadge}>
//           <Text style={styles.popularText}>MOST POPULAR</Text>
//         </View>
//       )}

//       <Text style={styles.planName}>{plan.name}</Text>
//       <Text style={styles.duration}>
//         {plan.duration_in_days} Days Access
//       </Text>

//       {/* PRICE */}
//       <View style={styles.priceRow}>
//         <Text style={styles.discountPrice}>₹{plan.discount_price}</Text>
//         <Text style={styles.originalPrice}>₹{plan.original_price}</Text>
//       </View>

//       {/* FEATURES */}
//       <View style={styles.features}>
//         {plan.access_features?.notes && <Feature icon="sticky-note" text="Notes" />}
//         {plan.access_features?.tests && <Feature icon="clipboard-check" text="Tests" />}
//         {plan.access_features?.videos && <Feature icon="video" text="Videos" />}
//         {plan.access_features?.ai_explanation && (
//           <Feature icon="robot" text="AI Explanation" />
//         )}
//       </View>

//       {/* BUTTON */}
//       <TouchableOpacity style={styles.buyBtn}>
//         <Text style={styles.buyText}>Buy Now</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const Feature = ({ icon, text }) => (
//   <View style={styles.featureItem}>
//     <Icon name={icon} size={14} color="#4CAF50" />
//     <Text style={styles.featureText}>{text}</Text>
//   </View>
// );

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F4F6F8',
//     paddingTop: 20,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1A3848',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   card: {
//     width: CARD_WIDTH,
//     backgroundColor: '#fff',
//     borderRadius: 18,
//     padding: 18,
//     alignSelf: 'center',
//     marginVertical: 12,
//     elevation: 4,
//   },
//   popularCard: {
//     borderWidth: 2,
//     borderColor: '#4CAF50',
//   },
//   popularBadge: {
//     position: 'absolute',
//     top: -12,
//     right: 20,
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   popularText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: 'bold',
//   },
//   planName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A3848',
//   },
//   duration: {
//     fontSize: 13,
//     color: '#777',
//     marginTop: 4,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 14,
//   },
//   discountPrice: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#E53935',
//     marginRight: 10,
//   },
//   originalPrice: {
//     fontSize: 14,
//     color: '#999',
//     textDecorationLine: 'line-through',
//   },
//   features: {
//     marginTop: 6,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   featureText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: '#333',
//   },
//   buyBtn: {
//     backgroundColor: '#1A3848',
//     paddingVertical: 14,
//     borderRadius: 14,
//     marginTop: 16,
//   },
//   buyText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontSize: 15,
//     fontWeight: '600',
//   },
// });

// export default PlansScreen;
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';

const API_URL = 'https://fornix-medical.vercel.app/api/v1/mobile/courses';

const PlansScreen = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const { width, height } = useWindowDimensions();
  
  // Responsive calculations
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isSmallPhone = width < 375;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(API_URL);
      const amcCourse = res.data.data.find(
        item => item.name.trim() === 'AMC'
      );
      if (amcCourse && amcCourse.plans) {
        const sortedPlans = amcCourse.plans.sort(
          (a, b) => a.priority_order - b.priority_order
        );
        setPlans(sortedPlans);
      }
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlan = ({ item }) => (
    <PlanCard 
      plan={item} 
      isTablet={isTablet}
      isLandscape={isLandscape}
      screenWidth={width}
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A3848" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[
        styles.heading,
        isTablet && styles.headingTablet,
        isSmallPhone && styles.headingSmall
      ]}>
        Choose Your Plan
      </Text>

      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        renderItem={renderPlan}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          isLandscape && styles.listContentLandscape,
          isTablet && styles.listContentTablet
        ]}
        numColumns={isLandscape || isTablet ? 2 : 1}
        key={isLandscape || isTablet ? 'two-column' : 'one-column'}
      />
    </View>
  );
};

/* ================= PLAN CARD ================= */

const PlanCard = ({ plan, isTablet, isLandscape, screenWidth }) => {
  // Dynamic card width calculation
  const cardWidth = useMemo(() => {
    if (isLandscape) {
      return screenWidth * 0.45;
    }
    if (isTablet) {
      return screenWidth * 0.8;
    }
    return screenWidth * 0.9;
  }, [isLandscape, isTablet, screenWidth]);

  const isSmallPhone = screenWidth < 375;

  return (
    <View style={[
      styles.card,
      { width: cardWidth },
      (isLandscape || isTablet) && styles.cardMultiColumn,
      plan.popular && styles.popularCard
    ]}>
      
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <Text style={[
        styles.planName,
        isTablet && styles.planNameTablet,
        isSmallPhone && styles.planNameSmall
      ]}>
        {plan.name}
      </Text>
      
      <Text style={[
        styles.duration,
        isSmallPhone && styles.durationSmall
      ]}>
        {plan.duration_in_days} Days Access
      </Text>

      {/* PRICE */}
      <View style={styles.priceRow}>
        <Text style={[
          styles.discountPrice,
          isTablet && styles.discountPriceTablet,
          isSmallPhone && styles.discountPriceSmall
        ]}>
          ₹{plan.discount_price}
        </Text>
        <Text style={[
          styles.originalPrice,
          isSmallPhone && styles.originalPriceSmall
        ]}>
          ₹{plan.original_price}
        </Text>
      </View>

      {/* FEATURES */}
      <View style={styles.features}>
        {plan.access_features?.notes && <Feature icon="sticky-note" text="Notes" isSmallPhone={isSmallPhone} />}
        {plan.access_features?.tests && <Feature icon="clipboard-check" text="Tests" isSmallPhone={isSmallPhone} />}
        {plan.access_features?.videos && <Feature icon="video" text="Videos" isSmallPhone={isSmallPhone} />}
        {plan.access_features?.ai_explanation && (
          <Feature icon="robot" text="AI Explanation" isSmallPhone={isSmallPhone} />
        )}
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={[
        styles.buyBtn,
        isTablet && styles.buyBtnTablet
      ]}>
        <Text style={[
          styles.buyText,
          isTablet && styles.buyTextTablet
        ]}>
          Buy Now
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Feature = ({ icon, text, isSmallPhone }) => (
  <View style={styles.featureItem}>
    <Icon name={icon} size={isSmallPhone ? 12 : 14} color="#4CAF50" />
    <Text style={[
      styles.featureText,
      isSmallPhone && styles.featureTextSmall
    ]}>
      {text}
    </Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3848',
    textAlign: 'center',
    marginBottom: 10,
  },
  headingTablet: {
    fontSize: 28,
    marginBottom: 20,
  },
  headingSmall: {
    fontSize: 20,
  },
  listContent: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  listContentLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentTablet: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignSelf: 'center',
    marginVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 280,
  },
  cardMultiColumn: {
    marginHorizontal: 10,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3848',
  },
  planNameTablet: {
    fontSize: 22,
  },
  planNameSmall: {
    fontSize: 16,
  },
  duration: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  durationSmall: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
    marginRight: 10,
  },
  discountPriceTablet: {
    fontSize: 28,
  },
  discountPriceSmall: {
    fontSize: 20,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  originalPriceSmall: {
    fontSize: 12,
  },
  features: {
    marginTop: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
  },
  featureTextSmall: {
    fontSize: 12,
    marginLeft: 6,
  },
  buyBtn: {
    backgroundColor: '#1A3848',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  buyBtnTablet: {
    paddingVertical: 16,
  },
  buyText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  buyTextTablet: {
    fontSize: 16,
  },
});

export default PlansScreen;
