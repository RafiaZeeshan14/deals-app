import { useState } from 'react';
import { StyleSheet, View, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [dataSaver, setDataSaver] = useState(false);

  const SettingsItem = ({ icon, title, value, type = 'arrow', onPress, onToggle }: { icon: string, title: string, value?: string | boolean, type?: 'arrow' | 'toggle' | 'text', onPress?: () => void, onToggle?: (v: boolean) => void }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, { borderBottomColor: colors.icon + '20' }]}
      onPress={onPress}
      disabled={type === 'toggle'}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
           <IconSymbol name={icon as any} size={20} color={colors.tint} />
        </View>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      
      {type === 'toggle' && (
        <Switch
          trackColor={{ false: '#767577', true: '#FF6B35' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onToggle}
          value={value as boolean}
        />
      )}

      {type === 'arrow' && (
        <View style={styles.rightContent}>
          {value && <ThemedText style={[styles.valueText, { color: colors.icon }]}>{value as string}</ThemedText>}
          <IconSymbol name="chevron.right" size={20} color={colors.icon} />
        </View>
      )}

      {type === 'text' && (
        <ThemedText style={[styles.valueText, { color: colors.icon }]}>{value as string}</ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings', headerBackTitle: 'Profile' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>Preferences</ThemedText>
          <SettingsItem 
            icon="moon.fill" 
            title="Dark Mode" 
            type="toggle"
            value={darkMode}
            onToggle={setDarkMode}
          />
          <SettingsItem 
            icon="globe" 
            title="Language" 
            value="English"
            onPress={() => {}}
          />
          <SettingsItem 
            icon="dollarsign.circle.fill" 
            title="Currency" 
            value="USD ($)"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>Data & Privacy</ThemedText>
          <SettingsItem 
            icon="wifi" 
            title="Data Saver" 
            type="toggle"
            value={dataSaver}
            onToggle={setDataSaver}
          />
          <SettingsItem 
            icon="trash" 
            title="Clear Cache" 
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.section}>
           <ThemedText style={styles.sectionHeader}>About</ThemedText>
           <SettingsItem 
            icon="info.circle" 
            title="Version" 
            type="text"
            value="1.0.0 (Build 12)"
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    opacity: 0.7,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
  },
});
