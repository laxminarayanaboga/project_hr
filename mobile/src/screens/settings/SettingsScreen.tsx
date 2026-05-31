import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {useNavigation} from '@react-navigation/native';

export default function SettingsScreen() {
  const {user, logout} = useAuthStore();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role?.replace('_', ' ')}</Text>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('NotificationPreferences')}
        testID="notifications-menu">
        <Text style={styles.menuIcon}>🔔</Text>
        <Text style={styles.menuLabel}>Notification Preferences</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={handleLogout}
        testID="logout-btn">
        <Text style={styles.menuIcon}>🚪</Text>
        <Text style={[styles.menuLabel, styles.logoutLabel]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 16},
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {color: '#fff', fontSize: 24, fontWeight: '700'},
  name: {fontSize: 18, fontWeight: '700', color: '#1a1a2e'},
  email: {fontSize: 14, color: '#888', marginTop: 2},
  role: {
    fontSize: 12,
    color: '#4361ee',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIcon: {fontSize: 20, marginRight: 12},
  menuLabel: {flex: 1, fontSize: 15, color: '#222', fontWeight: '500'},
  chevron: {fontSize: 18, color: '#ccc'},
  logoutItem: {borderWidth: 1, borderColor: '#fee2e2'},
  logoutLabel: {color: '#ef4444'},
});
