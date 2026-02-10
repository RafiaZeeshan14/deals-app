import { StyleSheet, ScrollView, View, TouchableOpacity, Text, ActivityIndicator, Image, Platform, Linking, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavoriteOnBackend } from '@/store/slices/favoritesSlice';
import { Offer } from '@/store/slices/offersSlice';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Share } from 'react-native';

export default function OfferDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();

  const { offers, trendingOffers } = useAppSelector((state) => state.offers);
  const { favorites } = useAppSelector((state) => state.favorites);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const [copied, setCopied] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { width } = Dimensions.get('window');
  const ITEM_WIDTH = width - 40; // marginHorizontal * 2

  useEffect(() => {
    const offerId = params.offerId as string;
    if (offerId) {
      // Find offer in all offers or trending offers
      const foundOffer = [...offers, ...trendingOffers].find(o => o.id === offerId);
      if (foundOffer) {
        setOffer(foundOffer);
      }
    }
  }, [params.offerId, offers, trendingOffers]);

  const isSaved = offer ? favorites.some(fav => fav.id === offer.id) : false;

  const handleCopy = async () => {
    if (offer?.promoCode) {
      await Clipboard.setStringAsync(offer.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "Please login to save offers",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    if (offer) {
      dispatch(toggleFavoriteOnBackend(offer));
    }
  };

  const handleGrabDeal = async () => {
    if (offer?.links && offer.links.length > 0) {
      const url = offer.links[0];
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", `Don't know how to open this URL: ${url}`);
        }
      } catch (err) {
        console.error('An error occurred', err);
        Alert.alert("Error", "Could not open link");
      }
    } else {
      Alert.alert("No Link", "This offer does not have a valid link.");
    }
  };

  const similarOffers = offers
    .filter(o => o.id !== offer?.id && o.category === offer?.category)
    .slice(0, 3)
    .map(o => ({
      id: o.id,
      brand: o.brand,
      brandIcon: o.brandIcon,
      brandColor: o.brandColor,
      offer: o.title,
      validity: o.expiryDate || o.timeLeft || 'Limited time offer',
      imageUrl: o.imageUrl,
    }));

  if (!offer) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading offer...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Stack.Screen
        options={{
          headerTitle: 'Offer Details',
          headerRight: () => (
            <View style={styles.topBarRight}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={async () => {
                  try {
                    const shareUrl = offer?.links && offer.links.length > 0 ? offer.links[0] : '';
                    const message = `🔥 Check out this amazing deal from ${offer?.brand}!\n\n*${offer?.title}*\n${offer?.description || ''}\n\nGrab it here: ${shareUrl}`;

                    await Share.share({
                      message: message,
                      title: offer?.title,
                      url: shareUrl, // iOS only
                    });
                  } catch (error) {
                    console.log('Error sharing:', error);
                  }
                }}
              >
                <IconSymbol name="square.and.arrow.up" size={24} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={isSaved ? "bookmark.fill" : "bookmark"}
                  size={24}
                  color={isSaved ? "#000000" : "#000000"}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.headerSection}>
          <View style={[styles.brandLogoContainer, { backgroundColor: '#fff', overflow: 'hidden' }]}>
            {offer.brandLogo ? (
              <Image
                source={{ uri: offer.brandLogo }}
                style={styles.brandLogoImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: 24 }}>{offer.brandIcon}</Text>
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>

            {/* Pricing Section */}
            {(offer.discountedPrice || offer.originalPrice) && (
              <View style={styles.priceContainer}>
                {offer.discountedPrice && (
                  <Text style={styles.discountedPrice}>RS:{offer.discountedPrice}</Text>
                )}
                {offer.originalPrice && (
                  <Text style={[styles.originalPrice, !offer.discountedPrice && styles.originalPriceOnly]}>
                    RS:{offer.originalPrice}
                  </Text>
                )}
                {offer.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{offer.discount}</Text>
                  </View>
                )}
              </View>
            )}

            {offer.expiryDate && (
              <Text style={styles.validityText}>Valid until {offer.expiryDate}</Text>
            )}
          </View>
        </View>

        {/* Tags Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow} contentContainerStyle={styles.tagsContainer}>
          {offer.isVerified && (
            <View style={[styles.tag, styles.tagVerified]}>
              <IconSymbol name="checkmark.circle.fill" size={12} color="#2E7D32" />
              <Text style={styles.tagTextVerified}>Verified</Text>
            </View>
          )}
          {offer.isTrending && (
            <View style={[styles.tag, styles.tagTrending]}>
              <IconSymbol name="flame.fill" size={12} color="#D32F2F" />
              <Text style={styles.tagTextTrending}>Trending</Text>
            </View>
          )}
          {/* Availability Tags */}
          {offer.hasWebsite && (
            <View style={[styles.tag, styles.tagOnline]}>
              <IconSymbol name="globe" size={12} color="#0288D1" />
              <Text style={styles.tagTextOnline}>Online</Text>
            </View>
          )}
          {offer.isPhysical && (
            <View style={[styles.tag, styles.tagStore]}>
              <IconSymbol name="building.2.fill" size={12} color="#7B1FA2" />
              <Text style={styles.tagTextStore}>In-Store</Text>
            </View>
          )}

          {offer.categoryName && (
            <View style={[styles.tag, styles.tagCategory]}>
              <IconSymbol name="tag.fill" size={12} color="#1976D2" />
              <Text style={styles.tagTextCategory}>{offer.categoryName}</Text>
            </View>
          )}

          {/* API Tags */}
          {offer.tags && offer.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, styles.tagGeneric]}>
              <Text style={styles.tagTextGeneric}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Hero Images - Horizontal Scroll */}
        <View style={styles.heroImageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideSize = event.nativeEvent.layoutMeasurement.width;
              const index = event.nativeEvent.contentOffset.x / slideSize;
              const roundIndex = Math.round(index);
              setActiveSlide(roundIndex);
            }}
          >
            {(offer.images && offer.images.length > 0 ? offer.images : [offer.imageUrl || 'https://via.placeholder.com/400x200?text=Offer']).map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.heroImageCarouselItem}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* Image Counter Badge */}
          {offer.images && offer.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeSlide + 1}/{offer.images.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this offer</Text>
          <Text style={styles.descriptionText}>
            {offer.description || `Get ${offer.discount} off on your ${offer.brand} purchase. Enjoy exclusive deals and savings.`}
          </Text>
        </View>

        {/* Variants Section */}
        {offer.variants && offer.variants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Options</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsContainer}>
              {offer.variants.map((variant, index) => (
                <View key={variant._id || index} style={styles.variantCard}>
                  <Text style={styles.variantText}>Size: {variant.size}</Text>
                  <Text style={styles.variantSubText}>{variant.colour}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Promo Code Section */}
        {offer.promoCode && (
          <View style={styles.promoSection}>
            <View style={styles.promoBox}>
              <View style={styles.promoCodeContent}>
                <Text style={styles.promoLabel}>Promo Code</Text>
                <Text style={styles.promoCodeText}>{offer.promoCode}</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoInfoBox}>
              <IconSymbol name="info.circle.fill" size={16} color="#2E7D32" />
              <Text style={styles.promoInfoText}>This code will be automatically applied at checkout</Text>
            </View>
          </View>
        )}

        {/* Similar Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Offers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarOffersList}>
            {similarOffers.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.similarCard}
                onPress={() => router.push({ pathname: '/offer-detail', params: { offerId: item.id } })}
              >
                <View style={styles.similarImageContainer}>
                  {/* Placeholder for similar offer image if not available */}
                  <Image
                    source={{ uri: item.imageUrl || `https://via.placeholder.com/150x100?text=${item.brand}` }}
                    style={styles.similarImage}
                  />
                </View>
                <View style={styles.similarCardContent}>
                  <View style={styles.similarHeader}>
                    <Text style={styles.similarBrandIcon}>{item.brandIcon}</Text>
                    <Text style={styles.similarBrandName}>{item.brand}</Text>
                  </View>
                  <Text style={styles.similarOfferTitle} numberOfLines={2}>{item.offer}</Text>
                  <Text style={styles.similarValidity}>{item.validity}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.grabButton} activeOpacity={0.8} onPress={handleGrabDeal}>
          <IconSymbol name="tag.fill" size={20} color="#FFF" style={{ marginRight: 8, transform: [{ rotate: '90deg' }] }} />
          <Text style={styles.grabButtonText}>Grab Deal</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // improved for safe area
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  brandLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandLogoImage: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 26,
    marginBottom: 4,
  },
  validityText: {
    fontSize: 13,
    color: '#757575',
  },
  tagsRow: {
    marginBottom: 20,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tagVerified: { backgroundColor: '#E8F5E9' },
  tagTextVerified: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  tagTrending: { backgroundColor: '#FFEBEE' },
  tagTextTrending: { fontSize: 12, fontWeight: '600', color: '#C62828' },
  tagExpires: { backgroundColor: '#FFF3E0' },
  tagTextExpires: { fontSize: 12, fontWeight: '600', color: '#EF6C00' },
  tagCategory: { backgroundColor: '#E3F2FD' },
  tagTextCategory: { fontSize: 12, fontWeight: '600', color: '#1565C0' },
  tagOnline: { backgroundColor: '#E1F5FE' },
  tagTextOnline: { fontSize: 12, fontWeight: '600', color: '#0288D1' },
  tagStore: { backgroundColor: '#F3E5F5' },
  tagTextStore: { fontSize: 12, fontWeight: '600', color: '#7B1FA2' },
  tagGeneric: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEEEEE' },
  tagTextGeneric: { fontSize: 12, fontWeight: '500', color: '#616161' },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  originalPrice: {
    fontSize: 16,
    color: '#757575',
    textDecorationLine: 'line-through',
  },
  originalPriceOnly: {
    textDecorationLine: 'none',
    color: '#000',
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D32F2F',
  },

  heroImageContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 300, // Increased height for better gallery view
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageCarouselItem: {
    width: Dimensions.get('window').width - 40, // Match container width
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,235,59, 1)', // bright yellow
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
  },
  overlayDiscount: {
    fontWeight: '800',
    fontSize: 24,
    color: '#000',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletList: {
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 10,
    color: '#000',
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
    flex: 1,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    width: '22%',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#616161',
    textAlign: 'center',
  },

  promoSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  promoCodeContent: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 8,
  },
  promoLabel: {
    fontSize: 10,
    color: '#757575',
    marginBottom: 2,
  },
  promoCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  copyBtn: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 4,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  promoInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  promoInfoText: {
    fontSize: 13,
    color: '#2E7D32',
    flex: 1,
  },

  similarOffersList: {
    paddingRight: 20,
    gap: 16,
  },
  similarCard: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  similarImageContainer: {
    height: 80,
    backgroundColor: '#F5F5F5',
  },
  similarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  similarCardContent: {
    padding: 12,
  },
  similarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  similarBrandIcon: {
    fontSize: 16,
  },
  similarBrandName: {
    fontSize: 12,
    color: '#616161',
    fontWeight: '500',
  },
  similarOfferTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    height: 36,
  },
  similarValidity: {
    fontSize: 10,
    color: '#9E9E9E',
  },

  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  grabButton: {
    backgroundColor: '#8E24AA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  grabButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  variantsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  variantCard: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    minWidth: 100,
  },
  variantText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  variantSubText: {
    fontSize: 12,
    color: '#616161',
  },
});
