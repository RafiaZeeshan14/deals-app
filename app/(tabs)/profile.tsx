import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/userSlice';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthGuard from '@/components/AuthGuard';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.user);
  const { favorites } = useAppSelector((state) => state.favorites);

  const handleLogout = () => {
    dispatch(logoutUser(null)); // Pass null or token if needed, but handled in thunk
    // Router replacement is handled in _layout based on auth state
  };

  const menuItems = [
    {
      icon: 'person.fill',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => router.push('/profile/edit'),
    },
    {
      icon: 'bell.fill',
      title: 'Notifications',
      subtitle: 'Manage notification settings',
      onPress: () => router.push('/profile/notifications'),
    },
    {
      icon: 'heart.fill',
      title: 'Saved Deals',
      subtitle: `View your ${favorites.length} saved offers`,
      onPress: () => router.push('/(tabs)/favorites'),
    },
    {
      icon: 'gearshape.fill',
      title: 'Settings',
      subtitle: 'App preferences and more',
      onPress: () => router.push('/profile/settings'),
    },
    {
      icon: 'questionmark.circle.fill',
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      onPress: () => router.push('/profile/support'),
    },
  ];

  // Early return if user is null to prevent accessing user properties
  if (!user) {
    return (
      <AuthGuard message="Login to access your profile and manage your account">
        <ThemedView style={styles.container} />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard message="Login to access your profile and manage your account">
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, { backgroundColor: colors.background }]}>
            <View style={[styles.profileImage, { backgroundColor: '#E2E8F0', borderColor: '#FFFFFF' }]}>
              <IconSymbol name="person.fill" size={60} color="#475569" />
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.profileEmail, { color: colors.icon }]}>{user.email}</Text>
            {/* <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity> */}
          </View>

          {/* Stats Section */}
          {/* <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Saved Deals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{user.usedDealsCount}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Used Deals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>${user.totalSaved}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Total Saved</Text>
          </View>
        </View> */}

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { backgroundColor: colors.background }]}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: colors.icon + '15' }]}>
                  <IconSymbol name={item.icon as any} size={24} color={colors.tint} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileEmoji: {
    fontSize: 50,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
