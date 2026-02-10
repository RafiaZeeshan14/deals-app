import { useState } from 'react';
import { StyleSheet, View, Switch, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [newDealsVal, setNewDealsVal] = useState(true);
  const [expiringVal, setExpiringVal] = useState(false);

  const NotificationItem = ({ title, description, value, onValueChange }: { title: string, description: string, value: boolean, onValueChange: (v: boolean) => void }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.icon + '20' }]}>
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={[styles.description, { color: colors.icon }]}>{description}</ThemedText>
      </View>
      <Switch
        trackColor={{ false: '#767577', true: '#FF6B35' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications', headerBackTitle: 'Profile' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>General</ThemedText>
          <NotificationItem 
            title="Push Notifications" 
            description="Receive alerts on your device"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <NotificationItem 
            title="Email Updates" 
            description="Receive newsletters and digests"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>Alert Types</ThemedText>
          <NotificationItem 
            title="New Deals" 
            description="Get notified when new offers arrive"
            value={newDealsVal}
            onValueChange={setNewDealsVal}
          />
          <NotificationItem 
            title="Expiring Offers" 
            description="Get notified before your saved deals expire"
            value={expiringVal}
            onValueChange={setExpiringVal}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
});
