import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavoriteOnBackend } from '@/store/slices/favoritesSlice';
import { Offer, fetchOffersByBrand } from '@/store/slices/offersSlice';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';

export default function BrandOffersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get brand details from route params
  const params = useLocalSearchParams();
  const brandId = params.brandId as string;
  const brandName = params.brandName as string;
  const brandIcon = params.brandIcon as string;

  const { offers, loading } = useAppSelector((state) => state.offers);
  const { favorites } = useAppSelector((state) => state.favorites);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch offers for this brand on mount
  useEffect(() => {
    if (brandId) {
      dispatch(fetchOffersByBrand(brandId) as any);
    }
  }, [brandId, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchOffersByBrand(brandId) as any);
    } catch (error) {
      console.error('Error refreshing brand offers:', error);
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

  if (loading && offers.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading {brandName} offers...</Text>
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
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandIconContainer}>
            {brandIcon && brandIcon.includes('http') ? (
              <Image
                source={{ uri: brandIcon }}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.brandEmoji}>{brandIcon || '🏢'}</Text>
            )}
          </View>
          <Text style={styles.brandTitle}>{brandName}</Text>
          <Text style={styles.offersCount}>
            {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'} Available
          </Text>
        </View>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnifyingglass" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No offers found for {brandName}</Text>
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

        {/* Refresh Button */}
        {offers.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={onRefresh}
              disabled={loading || refreshing}
              activeOpacity={0.8}
            >
              {(loading || refreshing) ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Refresh Offers</Text>
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
  brandHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  brandIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  brandEmoji: {
    fontSize: 48,
  },
  brandTitle: {
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
