import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { IconSymbol } from './ui/icon-symbol';
import { BrandColors, Shadows, Radius } from '@/constants/theme';

interface AuthGuardProps {
    children: React.ReactNode;
    message?: string;
}

export default function AuthGuard({ children, message = 'Login to continue' }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, user } = useAppSelector((state) => state.user);

    if (isAuthenticated && user) {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: BrandColors.primary + '15' }]}>
                    <IconSymbol name="lock.fill" size={48} color={BrandColors.primary} />
                </View>
                <Text style={styles.title}>Authentication Required</Text>
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(auth)/login')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Login / Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        backgroundColor: BrandColors.primary,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: Radius.xlarge,
        ...Shadows.medium,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
