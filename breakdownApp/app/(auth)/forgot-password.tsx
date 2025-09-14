import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { supabase } from '../utils/supabase';

export default function ForgotPassword() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValidEmail = (val: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

    const onSubmit = async () => {
        setError(null);
        const trimmed = email.trim();

        if (!isValidEmail(trimmed)) {
            setError('Enter a valid email address.');
            return;
        }

        setSubmitting(true);
        try {
            // Supabase intentionally avoids exposing whether a user exists to prevent enumeration.
            // This will attempt to send the reset email; error may still be generic.
            const { error: supaError } = await supabase.auth.resetPasswordForEmail(trimmed);
            if (supaError) {
                // Best-effort feedback; message may be generic.
                setError(supaError.message);
                return;
            }

            // Proceed to the update-password screen and pass the email as a param.
            router.push({
                pathname: '/(auth)/otp',
                params: { email: trimmed },
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ThemedText type="title" style={[styles.title, { color: theme.text }]}>
                Forgot Password
            </ThemedText>
            <ThemedText style={[styles.description, { color: theme.icon }]}>
                Enter your email to receive a password reset link.
            </ThemedText>

            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={theme.icon}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                    styles.input,
                    {
                        color: theme.text,
                        borderColor: theme.icon,
                        backgroundColor: colorScheme === 'dark' ? '#111' : '#fff',
                    },
                ]}
                editable={!submitting}
            />

            {error ? (
                <ThemedText style={[styles.error, { color: '#e53935' }]}>{error}</ThemedText>
            ) : null}

            <Pressable
                onPress={onSubmit}
                disabled={submitting || !email.trim()}
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: submitting || !email.trim() ? theme.icon : theme.tint,
                        opacity: pressed ? 0.85 : 1,
                    },
                ]}
            >
                {submitting ? (
                    <ActivityIndicator color="black" />
                ) : (
                    <ThemedText style={styles.buttonText}>Send reset link</ThemedText>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'SpaceMono',
    },
    error: {
        width: '100%',
        marginTop: 6,
        marginBottom: 2,
        fontSize: 14,
    },
    button: {
        width: '100%',
        marginTop: 8,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'black',
        fontFamily: 'SpaceMono',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
