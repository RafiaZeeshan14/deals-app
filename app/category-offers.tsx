import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavoriteOnBackend } from '@/store/slices/favoritesSlice';
import { Offer, fetchOffersByCategory } from '@/store/slices/offersSlice';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';

// Centralized mapping for local category images to improve performance and reliability
const CATEGORY_IMAGES: { [key: string]: any } = {
  fashion: require('@/assets/images/fashion-category.jpeg'),
  food: require('@/assets/images/food-category.jpeg'),
  electronics: require('@/assets/images/electronics-category.jpeg'),
  beauty: require('@/assets/images/beauty-category.jpeg'),
  kid: require('@/assets/images/kids-category.jpg'),
  all: require('@/assets/images/all-category.jpg'),
};

export default function CategoryOffersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get category details from route params
  const params = useLocalSearchParams();
  const categoryId = params.categoryId as string;
  const categoryName = params.categoryName as string;
  const categoryIcon = params.categoryIcon as string;
  const categoryColor = params.categoryColor as string;

  const { offers, loading, pagination } = useAppSelector((state) => state.offers);
  const { favorites } = useAppSelector((state) => state.favorites);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch offers for this category on mount
  useEffect(() => {
    if (categoryId) {
      setCurrentPage(1);
      dispatch(fetchOffersByCategory({ categoryId, page: 1, limit: 10 }) as any);
    }
  }, [categoryId, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    try {
      await dispatch(fetchOffersByCategory({ categoryId, page: 1, limit: 10 }) as any);
    } catch (error) {
      console.error('Error refreshing category offers:', error);
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

  const handleLoadMore = async () => {
    if (loading || !pagination || currentPage >= pagination.totalPages) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await dispatch(fetchOffersByCategory({ categoryId, page: nextPage, limit: 10 }) as any);
  };

  if (loading && offers.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading {categoryName} offers...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.primary} />
        }
      >
        {/* Category Header */}
        <View style={[styles.categoryHeader, { backgroundColor: (categoryColor || '#FF6B35') + '10' }]}>
          <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor || '#FF6B35' }]}>
            {categoryIcon === 'category-image' && categoryName ? (
              <Image
                source={
                  categoryName.toLowerCase().includes('fashion') ? CATEGORY_IMAGES.fashion :
                    categoryName.toLowerCase().includes('food') ? CATEGORY_IMAGES.food :
                      categoryName.toLowerCase().includes('electronic') ? CATEGORY_IMAGES.electronics :
                        categoryName.toLowerCase().includes('beauty') ? CATEGORY_IMAGES.beauty :
                          categoryName.toLowerCase().includes('kid') ? CATEGORY_IMAGES.kid :
                            CATEGORY_IMAGES.fashion // fallback
                }
                style={{ width: '100%', height: '100%', borderRadius: 50 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.categoryEmoji}>{categoryIcon || '📦'}</Text>
            )}
          </View>
          <Text style={styles.categoryTitle}>{categoryName || 'Category'}</Text>
          <Text style={styles.offersCount}>
            {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'} Available
          </Text>
        </View>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnifyingglass" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No offers found in {categoryName}</Text>
            <Text style={[styles.emptySubtext, { color: colors.text }]}>Check back later for new deals!</Text>
          </View>
        ) : (
          <View style={styles.offersGrid}>
            {offers.map((offer) => {
              if (!offer) return null;
              return (
                <TouchableOpacity
                  key={offer.id}
                  style={styles.offerCard}
                  activeOpacity={0.9}
                  onPress={() => handleOfferPress(offer)}
                >
                  {/* Image Section */}
                  <View style={styles.offerImageContainer}>
                    {offer?.imageUrl ? (
                      <Image
                        source={{ uri: offer.imageUrl }}
                        style={styles.offerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.offerBrandIcon, { backgroundColor: (offer?.brandColor || '#CCCCCC') + '20' }]}>
                        <Text style={styles.offerBrandEmoji}>{offer?.brandIcon || '🏷️'}</Text>
                      </View>
                    )}

                    {/* Badge on top left of image */}
                    {offer?.badge && offer.badge !== 'none' && (
                      <View style={[styles.offerBadgeContainer, { backgroundColor: offer.badgeColor || '#FF5722' }]}>
                        <Text style={styles.offerBadgeText}>{offer.badge.toUpperCase()}</Text>
                      </View>
                    )}

                    {/* Favorite Button on top right of image */}
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (offer) handleFavoriteToggle(offer);
                      }}
                    >
                      <IconSymbol
                        name={offer?.id && isFavorite(offer.id) ? "heart.fill" : "heart"}
                        size={18}
                        color={offer?.id && isFavorite(offer.id) ? "#FF4444" : "#1A1A1A"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Content Section */}
                  <View style={styles.offerContent}>
                    <Text style={styles.offerTitle} numberOfLines={2}>{offer?.title || 'Untitled Offer'}</Text>

                    <View style={styles.priceRow}>
                      {offer?.discountedPrice && (
                        <Text style={styles.offerPrice}>Rs:{offer.discountedPrice}</Text>
                      )}
                      {offer?.originalPrice && (
                        <Text style={styles.offerOriginalPrice}>Rs:{offer.originalPrice}</Text>
                      )}
                      {offer?.discount && (
                        <Text style={styles.offerDiscountText}>{offer.discount} Off</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.grabDealButton}
                      onPress={() => offer && handleOfferPress(offer)}
                    >
                      <Text style={styles.grabDealText}>Grab Deal</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Load More Button */}
        {offers.length > 0 && pagination && currentPage < pagination.totalPages && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  categoryHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  offersCount: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 24,
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
  offerImage: {
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
  offerBadgeContainer: {
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
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  favoriteButton: {
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
  offerContent: {
    padding: 12,
  },
  offerTitle: {
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
  offerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  offerOriginalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  offerDiscountText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '700',
  },
  grabDealButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  grabDealText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  loadMoreContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loadMoreButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
