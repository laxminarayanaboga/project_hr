import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {biometricService} from '../../services/biometricService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'hrapp_biometric_enabled';

export default function LoginScreen() {
  const {login} = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometryLabel, setBiometryLabel] = useState('Biometrics');

  useEffect(() => {
    (async () => {
      const available = await biometricService.isAvailable();
      if (available) {
        setBiometricAvailable(true);
        const type = await biometricService.getBiometryType();
        setBiometryLabel(biometricService.getFriendlyName(type));
        const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        setBiometricEnabled(enabled === 'true');
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      Alert.alert('Login failed', 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    const success = await biometricService.authenticate(
      `Log in with ${biometryLabel}`,
    );
    if (success) {
      setLoading(true);
      try {
        const storedEmail = await AsyncStorage.getItem('hrapp_last_email');
        const storedPassword = await AsyncStorage.getItem('hrapp_last_password');
        if (storedEmail && storedPassword) {
          await login(storedEmail, storedPassword);
        } else {
          Alert.alert('Setup required', 'Please log in with email and password first to enable biometrics.');
        }
      } catch {
        Alert.alert('Login failed', 'Unable to log in with biometrics.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleBiometric = async () => {
    const next = !biometricEnabled;
    if (next) {
      await AsyncStorage.setItem('hrapp_last_email', email);
      await AsyncStorage.setItem('hrapp_last_password', password);
    }
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(next));
    setBiometricEnabled(next);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>HR App</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          testID="email-input"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          testID="password-input"
        />

        {biometricAvailable && (
          <TouchableOpacity
            style={styles.biometricToggle}
            onPress={toggleBiometric}>
            <Text style={styles.biometricToggleText}>
              {biometricEnabled ? '✓' : '○'} Enable {biometryLabel}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          testID="login-button">
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {biometricAvailable && biometricEnabled && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometric}
            testID="biometric-button">
            <Text style={styles.biometricButtonText}>
              Use {biometryLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  biometricToggle: {
    marginBottom: 14,
  },
  biometricToggleText: {
    color: '#4361ee',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4361ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#4361ee',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#4361ee',
    fontSize: 15,
    fontWeight: '500',
  },
});
