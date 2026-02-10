import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavoriteOnBackend, loadFavoritesFromBackend } from '@/store/slices/favoritesSlice';
import { Offer, setCategories, setLoading, setOffers, setPopularBrands, setTrendingOffers, fetchAllOffers, fetchTrendingOffers, fetchCategories, fetchAllBrands } from '@/store/slices/offersSlice';
import { initialAllOffers, initialCategories, initialPopularBrands, initialTrendingOffers } from '@/utils/data';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, Gradients } from '@/constants/theme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { offers, trendingOffers, popularBrands, categories: fetchedCategories, loading } = useAppSelector((state) => state.offers);
  const { favorites } = useAppSelector((state) => state.favorites);
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselScrollRef = useRef<ScrollView>(null);

  // Combine "All" with fetched categories
  const categories = ['All', ...fetchedCategories.map(cat => cat.name)];

  // Initialize data on mount - fetch from backend API
  useEffect(() => {
    if (offers.length === 0) {
      // Fetch data from backend APIs using Redux thunks
      dispatch(fetchAllOffers() as any);
      dispatch(fetchTrendingOffers() as any);
      dispatch(fetchCategories() as any);
      dispatch(fetchAllBrands() as any);
      if (isAuthenticated) {
        dispatch(loadFavoritesFromBackend());
      }
    }
  }, [dispatch, isAuthenticated]);

  // Filter offers based on selected category
  const filteredOffers = selectedCategory === 'All'
    ? offers
    : offers.filter(offer => {
      // Find the category object that matches the selected category name
      const category = fetchedCategories.find(cat => cat.name === selectedCategory);
      // Check if the offer's category matches the selected category ID
      return category && offer.categoryId === category.id;
    });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch fresh data from backend APIs
      await Promise.all([
        dispatch(fetchAllOffers() as any),
        dispatch(fetchTrendingOffers() as any),
        dispatch(fetchCategories() as any),
        dispatch(fetchAllBrands() as any),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOfferPress = (offer: Offer) => {
    router.push({
      pathname: '/offer-detail',
      params: { offerId: offer.id },
    });
  };

  const handleFavoriteToggle = (offer: Offer) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please sign in to save your favorite deals',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Login / Sign Up',
            onPress: () => router.push('/(auth)/login')
          }
        ]
      );
      return;
    }
    dispatch(toggleFavoriteOnBackend(offer));
  };

  const isFavorite = (offerId: string) => {
    if (!isAuthenticated) return false;
    return favorites.some(fav => fav.id === offerId);
  };

  // Auto-scroll carousel effect
  useEffect(() => {
    if (trendingOffers.length <= 1) return;

    const interval = setInterval(() => {
      setActiveCarouselIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % trendingOffers.length;

        // Scroll to next item
        if (carouselScrollRef.current) {
          const screenWidth = 350; // Approximate card width + margin
          carouselScrollRef.current.scrollTo({
            x: nextIndex * screenWidth,
            animated: true,
          });
        }

        return nextIndex;
      });
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [trendingOffers.length]);

  if (loading && offers.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading offers...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'Alex'} 👋</Text>
            <Text style={styles.subtitle}>Discover today's best deals</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileImage, { borderColor: BrandColors.primary }]}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.profileEmoji}>{user?.avatar || '👩'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.primary} />
        }
      >
        {/* Category Filters */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              // Get category image/emoji based on name
              const getCategoryDisplay = (name: string) => {
                const lowerName = name.toLowerCase();
                if (name === 'All') return { emoji: '🛍️', color: '#FF6B35' };
                if (lowerName.includes('fashion')) return { emoji: '👗', color: '#E91E63' };
                if (lowerName.includes('food')) return { emoji: '🍔', color: '#FF9800' };
                if (lowerName.includes('electronic')) return { emoji: '📱', color: '#2196F3' };
                if (lowerName.includes('beauty')) return { emoji: '💄', color: '#9C27B0' };
                if (lowerName.includes('men')) return { emoji: '👔', color: '#3F51B5' };
                if (lowerName.includes('women')) return { emoji: '👚', color: '#E91E63' };
                if (lowerName.includes('kid')) return { emoji: '🧸', color: '#FF5722' };
                return { emoji: '📦', color: '#4CAF50' };
              };

              const display = getCategoryDisplay(category);

              return (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.categoryCircle,
                    isSelected && { borderColor: display.color, borderWidth: 3 }
                  ]}>
                    <View style={[styles.categoryImageContainer, { backgroundColor: display.color + '20' }]}>
                      <Text style={styles.categoryEmoji}>{display.emoji}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.categoryLabel,
                    isSelected && { color: display.color, fontWeight: '700' }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Trending Offers Section */}
        {trendingOffers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Offers</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.carouselContainer}>
              <ScrollView
                ref={carouselScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingScroll}
                onMomentumScrollEnd={(event) => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const index = Math.round(contentOffsetX / 350);
                  setActiveCarouselIndex(index);
                }}
                decelerationRate="fast"
                snapToInterval={350}
              >
                {trendingOffers.map((offer) => (
                  <TouchableOpacity
                    key={offer.id}
                    style={styles.trendingCard}
                    activeOpacity={0.9}
                    onPress={() => handleOfferPress(offer)}
                  >
                    <LinearGradient
                      colors={['#FF6B9D', '#FFA06B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.trendingGradientCard}
                    >
                      {/* Badge on top right */}
                      <View style={styles.topRightBadge}>
                        <Text style={styles.topRightBadgeText}>{offer.badge}</Text>
                      </View>

                      <View style={styles.trendingContent}>
                        <Text style={styles.trendingBadgeNew}>{offer.discount || offer.badge}</Text>
                        <Text style={styles.trendingTitleNew}>{offer.title}</Text>
                        <Text style={styles.trendingDescriptionNew}>{offer.description}</Text>
                        <TouchableOpacity style={styles.shopNowButtonNew}>
                          <Text style={styles.shopNowTextNew}>Shop Now →</Text>
                        </TouchableOpacity>
                      </View>
                      {offer.imageUrl && (
                        <Image
                          source={{ uri: offer.imageUrl }}
                          style={styles.trendingImage}
                          resizeMode="contain"
                        />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              <View style={styles.paginationContainer}>
                {trendingOffers.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeCarouselIndex && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Top Brands Section */}
        {popularBrands.length > 0 && (
          <View style={[styles.section, styles.brandsSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Brands</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsScroll}
            >
              {popularBrands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.brandItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    // Navigate to brand offers or similar
                    // For now, maybe just log or something
                  }}
                >
                  <View style={styles.brandCircle}>
                    {brand.icon && brand.icon.includes('http') ? (
                      <Image
                        source={{ uri: brand.icon }}
                        style={styles.brandLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.brandEmojiIcon}>{brand.icon || '🏢'}</Text>
                    )}
                  </View>
                  <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Offers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {filteredOffers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No offers found</Text>
            </View>
          ) : (
            <View style={styles.offersGrid}>
              {filteredOffers.map((offer) => (
                <TouchableOpacity
                  key={offer.id}
                  style={styles.offerCard}
                  activeOpacity={0.9}
                  onPress={() => handleOfferPress(offer)}
                >
                  {/* Image Section */}
                  <View style={styles.offerImageContainer}>
                    {offer.imageUrl ? (
                      <Image
                        source={{ uri: offer.imageUrl }}
                        style={styles.offerImageNew}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.offerBrandIcon, { backgroundColor: offer.brandColor + '20' }]}>
                        <Text style={styles.offerBrandEmoji}>{offer.brandIcon}</Text>
                      </View>
                    )}

                    {/* Badge on top left of image */}
                    {offer.badge && offer.badge !== 'none' && (
                      <View style={[styles.offerBadgeContainerNew, { backgroundColor: offer.badgeColor || '#FF5722' }]}>
                        <Text style={styles.offerBadgeTextNew}>{offer.badge.toUpperCase()}</Text>
                      </View>
                    )}

                    {/* Favorite Button on top right of image */}
                    <TouchableOpacity
                      style={styles.favoriteButtonNew}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(offer);
                      }}
                    >
                      <IconSymbol
                        name={isFavorite(offer.id) ? "heart.fill" : "heart"}
                        size={18}
                        color={isFavorite(offer.id) ? "#FF4444" : "#1A1A1A"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Content Section */}
                  <View style={styles.offerContentNew}>
                    <Text style={styles.offerTitleNew} numberOfLines={2}>{offer.title}</Text>

                    <View style={styles.priceRow}>
                      {offer.discountedPrice && (
                        <Text style={styles.offerPriceNew}>${offer.discountedPrice}</Text>
                      )}
                      {offer.originalPrice && (
                        <Text style={styles.offerOriginalPriceNew}>${offer.originalPrice}</Text>
                      )}
                      {offer.discount && (
                        <Text style={styles.offerDiscountTextNew}>{offer.discount} Off</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.grabDealButtonNew}
                      onPress={() => handleOfferPress(offer)}
                    >
                      <Text style={styles.grabDealTextNew}>Grab Deal</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  profileEmoji: {
    fontSize: 28,
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryScroll: {
    gap: 16,
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  categoryImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  brandsSection: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.primary,
  },
  carouselContainer: {
    position: 'relative',
  },
  trendingScroll: {
    paddingHorizontal: 20,
  },
  trendingCard: {
    width: 330,
    height: 180,
    marginRight: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingGradientCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  trendingContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  trendingBadgeNew: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  trendingTitleNew: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  trendingDescriptionNew: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 12,
  },
  shopNowButtonNew: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopNowTextNew: {
    color: '#FF6B9D',
    fontSize: 13,
    fontWeight: '600',
  },
  trendingImage: {
    width: 120,
    height: 140,
    position: 'absolute',
    right: 10,
    bottom: 0,
  },
  topRightBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  topRightBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: BrandColors.primary,
  },
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },

  offerCard: {
    width: '47.5%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  offerImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  offerImageNew: {
    width: '100%',
    height: '100%',
  },
  offerBrandIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerBrandEmoji: {
    fontSize: 48,
  },
  offerBadgeContainerNew: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  offerBadgeTextNew: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  favoriteButtonNew: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  offerContentNew: {
    padding: 12,
  },
  offerTitleNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  offerPriceNew: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  offerOriginalPriceNew: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  offerDiscountTextNew: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '700',
  },
  grabDealButtonNew: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  grabDealTextNew: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  brandsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  brandItem: {
    alignItems: 'center',
    width: 70,
  },
  brandCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    padding: 10,
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  brandEmojiIcon: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});
