import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '@/store/slices/userSlice';
import { brandService } from '@/services/brand.service';
import { Brand } from '@/types/api.types';

// Chip Component
const Chip = ({ label, isSelected, onPress }: { label: string, isSelected: boolean, onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.chip, isSelected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // State for selected interests and brands
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const apiBrands = await brandService.getAllBrandsForApp();
        // Extract brand names from API response - safely handle the response
        const brandNames = apiBrands.map((brand: Brand) => {
          // Make sure we're extracting just the name string
          return typeof brand.name === 'string' ? brand.name : String(brand.name);
        }).filter(name => name && name.trim() !== '');

        setBrands(brandNames);
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Fallback to some default brands on error
        setBrands(['Nike', 'Adidas', 'Apple', 'Samsung', 'Starbucks', 'McDonald\'s']);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Variables
  const snapPoints = useMemo(() => ['60%', '75%'], []);

  // Callbacks
  const handlePresentModalPress = useCallback(() => {
    console.log('Opening bottom sheet...');
    bottomSheetModalRef.current?.present();
  }, []);

  const handleContinue = useCallback(() => {
    dispatch(completeOnboarding());
    router.replace('/(tabs)');
  }, [router, dispatch]);

  const toggleSelection = (set: Set<string>, updateSet: Function, item: string) => {
    const newSet = new Set(set);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    updateSet(newSet);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const hasSelection = useMemo(() => {
    return selectedBrands.size > 0;
  }, [selectedBrands]);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          autoPlay
          loop
          style={{
            width: width * 0.6,
            height: width * 0.6,
          }}
          source={require('../assets/buy-animation.json')}
        />
        <Text style={styles.title}>Welcome to Dealo</Text>
        <Text style={styles.subtitle}>Personalize your experience</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePresentModalPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        enablePanDownToClose={true}
      >
        <View style={styles.sheetContentContainer}>
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Tell us what you like</Text>
            <Text style={styles.sheetSubtitle}>Pick your favorite brands to get personalized deals</Text>
          </View>

          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brands</Text>
              {loadingBrands ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FF6B35" />
                  <Text style={{ marginTop: 8, color: '#666' }}>Loading brands...</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {brands.map((item: string) => (
                    <Chip
                      key={item}
                      label={item}
                      isSelected={selectedBrands.has(item)}
                      onPress={() => toggleSelection(selectedBrands, setSelectedBrands, item)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </BottomSheetScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {hasSelection ? 'Give Me Deals' : 'Skip for Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5CC',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF8C5A',
    opacity: 0.8,
  },
  button: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 24,
  },
  sheetContentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding to prevent overlap with fixed footer
  },
  horizontalScrollContent: {
    gap: 10,
    paddingRight: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#FFF0E6',
    borderColor: '#FF6B35',
  },
  chipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  continueButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerSpacing: {
    height: 80, // Space for footer
  }
});
