import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SupportScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I redeem a deal?',
      answer: 'Click on the "Shop Now" or "Grab Deal" button on the offer details page. It will take you to the retailer\'s website or provide a code to use in-store.'
    },
    {
      id: '2',
      question: 'Are the coupons free to use?',
      answer: 'Yes! All deals and coupons listed on Dealo are completely free to use.'
    },
    {
      id: '3',
      question: 'My promo code isn\'t working',
      answer: 'Promo codes can expire or have specific terms. Please check the "Valid until" date and any conditions listed in the offer description.'
    },
    {
      id: '4',
      question: 'How do I save a deal for later?',
      answer: 'Tap the bookmark icon (heart or ribbon) on any offer card. You can find all your saved deals in the "Saved Deals" section of your profile.'
    }
  ];

  const handleContact = async () => {
     const email = 'support@dealo.com';
     const subject = 'Support Request';
     const url = `mailto:${email}?subject=${subject}`;

     try {
       const supported = await Linking.canOpenURL(url);
       if (supported) {
         await Linking.openURL(url);
       } else {
         Alert.alert('Email', `Please email us at ${email}`);
       }
     } catch (err) {
       Alert.alert('Email', `Please email us at ${email}`);
     }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Support', headerBackTitle: 'Profile' }} />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={styles.contactCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
            <IconSymbol name="envelope.fill" size={32} color={colors.tint} />
          </View>
          <ThemedText style={styles.contactTitle}>Need specific help?</ThemedText>
          <ThemedText style={styles.contactSubtitle}>Our team is here to assist you.</ThemedText>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.tint }]} onPress={handleContact}>
            <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.sectionHeader}>Frequently Asked Questions</ThemedText>
        
        <View style={styles.faqList}>
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <TouchableOpacity 
                key={faq.id} 
                style={[styles.faqItem, { borderColor: colors.icon + '20', backgroundColor: colors.background }]}
                onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <ThemedText style={styles.question}>{faq.question}</ThemedText>
                  <IconSymbol 
                    name={isExpanded ? 'chevron.up' : 'chevron.down'} 
                    size={20} 
                    color={colors.icon} 
                  />
                </View>
                {isExpanded && (
                  <ThemedText style={[styles.answer, { color: colors.icon }]}>
                    {faq.answer}
                  </ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => {}}>
             <ThemedText style={styles.link}>Terms of Service</ThemedText>
          </TouchableOpacity>
          <ThemedText style={{ color: colors.icon }}>•</ThemedText>
          <TouchableOpacity onPress={() => {}}>
             <ThemedText style={styles.link}>Privacy Policy</ThemedText>
          </TouchableOpacity>
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
  contactCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 40,
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
