import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavoriteOnBackend, loadFavoritesFromBackend, loadFavoritesFromStorage } from '@/store/slices/favoritesSlice';
import { useRouter } from 'expo-router';
import { Offer } from '@/store/slices/offersSlice';
import AuthGuard from '@/components/AuthGuard';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { favorites, loading } = useAppSelector((state) => state.favorites);
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(loadFavoritesFromStorage());
    if (isAuthenticated) {
      dispatch(loadFavoritesFromBackend());
    }
  }, [dispatch, isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isAuthenticated) {
      await dispatch(loadFavoritesFromBackend());
    } else {
      await dispatch(loadFavoritesFromStorage());
    }
    setRefreshing(false);
  };

  const handleRemoveFavorite = (offer: Offer) => {
    dispatch(toggleFavoriteOnBackend(offer));
  };

  const handleOfferPress = (offer: Offer) => {
    router.push({
      pathname: '/offer-detail',
      params: { offerId: offer.id },
    });
  };

  const renderContent = () => {
    if (loading && favorites.length === 0) {
      return (
        <ThemedView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading favorites...</ThemedText>
        </ThemedView>
      );
    }

    if (favorites.length === 0) {
      return (
        <ThemedView style={styles.container}>
          <ThemedView style={[styles.header, { backgroundColor: colors.background }]}>
            <ThemedText type="title" style={styles.headerTitle}>Saved</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Your saved deals</ThemedText>
          </ThemedView>
          <View style={styles.emptyContainer}>
            <IconSymbol name="heart" size={64} color={colors.icon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>No favorites yet</ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
              Start saving deals you love!
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.header, { backgroundColor: colors.background }]}>
          <ThemedText type="title" style={styles.headerTitle}>Saved</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{favorites.length} saved {favorites.length === 1 ? 'deal' : 'deals'}</ThemedText>
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
          }
        >
          {favorites.map((deal) => (
            <TouchableOpacity
              key={deal.id}
              style={[styles.dealCard, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}
              activeOpacity={0.7}
              onPress={() => handleOfferPress(deal)}
            >
              <View style={styles.dealImageContainer}>
                {deal.imageUrl ? (
                  <Image
                    source={{ uri: deal.imageUrl }}
                    style={styles.dealImage}
                    resizeMode="cover"
                  />
                ) : (
                  <ThemedText style={styles.dealEmoji}>{deal.brandIcon}</ThemedText>
                )}
                {deal.badge && deal.badge !== 'none' && (
                  <View style={[styles.discountBadge, { backgroundColor: deal.badgeColor || '#FF5722' }]}>
                    <ThemedText style={styles.discountText}>{deal.badge.toUpperCase()}</ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.dealContent}>
                <View style={styles.dealHeader}>
                  <View style={styles.dealTitleContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.dealTitle}>{deal.title}</ThemedText>
                    <ThemedText style={[styles.storeName, { color: colors.icon }]}>{deal.brand}</ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveFavorite(deal)}
                    style={styles.favoriteButton}
                  >
                    <IconSymbol
                      name="heart.fill"
                      size={24}
                      color="#FF4444"
                    />
                  </TouchableOpacity>
                </View>

                {deal.description && (
                  <ThemedText style={[styles.description, { color: colors.icon }]} numberOfLines={2}>
                    {deal.description}
                  </ThemedText>
                )}

                {deal.originalPrice && deal.discountedPrice && (
                  <View style={styles.priceContainer}>
                    <ThemedText style={[styles.originalPrice, { color: colors.icon }]}>
                      {deal.originalPrice}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={[styles.discountedPrice, { color: '#FF4444' }]}>
                      {deal.discountedPrice}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.dealFooter}>
                  {deal.category && (
                    <View style={[styles.categoryBadge, { backgroundColor: colors.icon + '15' }]}>
                      <ThemedText style={[styles.categoryText, { color: colors.icon }]}>
                        {deal.category}
                      </ThemedText>
                    </View>
                  )}
                  {deal.timeLeft && (
                    <View style={styles.timeLeftContainer}>
                      <IconSymbol name="clock.fill" size={12} color="#50C878" />
                      <ThemedText style={[styles.expiryText, { color: colors.icon }]}>
                        {deal.timeLeft}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    );
  };

  return (
    <AuthGuard message="Login to view and sync your saved deals across devices">
      {renderContent()}
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E520',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  dealCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dealImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    // Removed overflow: 'hidden' to allow badge to show
  },
  dealImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  dealEmoji: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 5,
    // paddingVertical: 1,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dealContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dealTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  dealTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
  },
  favoriteButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
