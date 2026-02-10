import { StyleSheet, ScrollView, TouchableOpacity, View, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilterCategory, fetchCategories, fetchAllOffers } from '@/store/slices/offersSlice';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Get data from Redux store
  const { categories, offers, loading } = useAppSelector((state) => state.offers);

  const [refreshing, setRefreshing] = useState(false);

  // Initial fetch on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(fetchCategories() as any);
    dispatch(fetchAllOffers({}) as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Helper to get count/icon display based on category name
  const getCategoryDisplay = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('all')) {
      return { type: 'image', source: require('@/assets/images/all-category.jpg') };
    }
    if (lowerName.includes('fashion') || lowerName.includes('cloth')) {
      return { type: 'image', source: require('@/assets/images/fashion-category.jpeg') };
    }
    if (lowerName.includes('food') || lowerName.includes('dining')) {
      return { type: 'image', source: require('@/assets/images/food-category.jpeg') };
    }
    if (lowerName.includes('electronic') || lowerName.includes('mobile')) {
      return { type: 'image', source: require('@/assets/images/electronics-category.jpeg') };
    }
    if (lowerName.includes('beauty') || lowerName.includes('health')) {
      return { type: 'image', source: require('@/assets/images/beauty-category.jpeg') };
    }
    if (lowerName.includes('kid')) {
      return { type: 'image', source: require('@/assets/images/kids-category.jpg') };
    }
    return { type: 'icon', name: getCategoryIcon(name) };
  };

  const handleCategoryPress = (categoryName: string) => {
    // Find the category object to get its ID
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      const displayName = category.name.toLowerCase() === 'fast food' ? 'Food & Restaurant' : category.name;
      const display = getCategoryDisplay(category.name);
      const color = getCategoryColor(category.name);

      router.push({
        pathname: '/category-offers',
        params: {
          categoryId: category.id,
          categoryName: displayName,
          categoryIcon: display.type === 'image' ? 'category-image' : display.name,
          categoryColor: color,
        },
      });
    }
  };

  // Helper to get deal count for a category
  const getCategoryCount = (categoryId: string) => {
    return offers.filter(offer => offer.categoryId === categoryId).length;
  };

  // Helper to get icon based on category name
  const getCategoryIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('fashion') || lowerName.includes('cloth')) return 'shirt-outline';
    if (lowerName.includes('food') || lowerName.includes('dining')) return 'restaurant-outline';
    if (lowerName.includes('electronic') || lowerName.includes('mobile')) return 'laptop-outline';
    if (lowerName.includes('beauty') || lowerName.includes('health')) return 'sparkles-outline';
    if (lowerName.includes('travel') || lowerName.includes('hotel')) return 'airplane-outline';
    if (lowerName.includes('entertainment') || lowerName.includes('movie')) return 'film-outline';
    if (lowerName.includes('grocer')) return 'leaf-outline';
    if (lowerName.includes('home') || lowerName.includes('living')) return 'home-outline';
    if (lowerName.includes('kid')) return 'happy-outline';
    if (lowerName.includes('fast food')) return 'fast-food-outline';
    return 'cube-outline';
  };

  // Helper to get color based on category name (consistent colors)
  const getCategoryColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('fashion')) return '#E91E63';
    if (lowerName.includes('food')) return '#FF9800';
    if (lowerName.includes('electronic')) return '#2196F3';
    if (lowerName.includes('beauty')) return '#9C27B0';
    if (lowerName.includes('travel')) return '#00BCD4';
    if (lowerName.includes('entertainment')) return '#673AB7';
    return '#4CAF50'; // Default green
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Categories</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Browse deals by category</ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        {loading && categories.length === 0 ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={{ marginTop: 10 }}>Loading categories...</ThemedText>
          </View>
        ) : (
          <View style={styles.grid}>
            {categories
              .filter(cat => {
                const n = cat.name.toLowerCase();
                if (['bbq', 'traditional', 'western wear'].includes(n)) return false;
                // Filter out any other food-related categories to avoid duplicates
                if ((n.includes('food') || n.includes('restaurant')) && n !== 'fast food') return false;
                return true;
              })
              .map((category) => {
                const displayName = category.name.toLowerCase() === 'fast food' ? 'Food & Restaurant' : category.name;
                const display = getCategoryDisplay(category.name);
                const color = getCategoryColor(category.name);

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    activeOpacity={0.7}
                    onPress={() => handleCategoryPress(category.name)}
                  >
                    <View style={styles.iconContainer}>
                      {display.type === 'image' ? (
                        <Image
                          source={display.source}
                          style={{ width: '100%', height: '100%', borderRadius: 40 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name={display.name as any} size={40} color={color} />
                      )}
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.categoryName} numberOfLines={1}>
                      {displayName}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 4,
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1, // Make it square-ish
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F3F4F6', // Light greyish
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
