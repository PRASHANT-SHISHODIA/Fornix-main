import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
  ActivityIndicator,
} from 'react-native';

const {width} = Dimensions.get('window');

const BannerCarousel = ({
  // Data prop with your structure
  banners = [],
  // Original props
  autoPlay = true,
  timer = 3000,
  onPress,
  indicatorActiveColor = '#8337B2',
  indicatorInactiveColor = '#D3D3D3',
  animation = true,
  // Loading and error states
  loading = false,
  error = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const flatListRef = useRef();

  useEffect(() => {
    if (autoPlay && banners.length > 0) {
      startAutoPlay();
    }
    return stopAutoPlay;
  }, [autoPlay, banners]);

  const startAutoPlay = () => {
    if (intervalRef.current || banners.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: animation,
        });
        return nextIndex;
      });
    }, timer);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restartAutoPlayWithDelay = () => {
    stopAutoPlay();
    setTimeout(() => {
      startAutoPlay();
    }, 3000);
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {
      useNativeDriver: false,
      listener: event => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
      },
    },
  );

  const renderItem = ({item}) => {
    // Use image_url from your data structure
    const imageUrl = item.image_url;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress && onPress(item)}
        style={styles.bannerTouchable}>
        <Image 
          source={{uri: imageUrl}} 
          style={styles.bannerImage} 
          resizeMode="cover"
          onError={(error) => console.log('Image loading error:', error)}
        />
        {/* Optional: Add URL link if item has url property */}
        {item.url ? (
          <View style={styles.urlOverlay}>
            <Text style={styles.urlText}>Tap to learn more</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8337B2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error loading banners: {error}</Text>
      </View>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No banners available</Text>
      </View>
    );
  }

  // Filter only active banners if needed
  const activeBanners = banners.filter(banner => banner.status === true);

  if (activeBanners.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No active banners available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={activeBanners}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={restartAutoPlayWithDelay}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 500);
        }}
        // Optional: add snap to alignment for better UX
        snapToAlignment="center"
        decelerationRate="fast"
      />

      <View style={styles.indicatorContainer}>
        {activeBanners.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex
                    ? indicatorActiveColor
                    : indicatorInactiveColor,
              },
            ]}
          />
        ))}
      </View>

      {/* Optional: Show current index and total */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {activeBanners.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#f5f5f5', // Optional background
  },
  bannerTouchable: {
    flex: 1,
    position: 'relative',
  },
  bannerImage: {
    width,
    height: 220,
    borderRadius: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  urlOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  urlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  counterContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});

export default BannerCarousel;