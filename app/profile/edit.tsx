import { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Alert, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { updateUser } from '@/store/slices/userSlice'; // Assuming you have this action

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, loading } = useAppSelector((state) => state.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      // await dispatch(updateUser({ id: user!.id, name, email, phone })).unwrap();
      
      // Update local storage or state if real API not ready
      // For now just simulate success
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }, 1000);
      
    } catch (error) {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Profile', headerBackTitle: 'Profile' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Full Name</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon + '40', backgroundColor: colors.background }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.icon}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Email Address</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon + '40', backgroundColor: colors.background }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
            placeholderTextColor={colors.icon}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Phone Number</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon + '40', backgroundColor: colors.background }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            placeholderTextColor={colors.icon}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
