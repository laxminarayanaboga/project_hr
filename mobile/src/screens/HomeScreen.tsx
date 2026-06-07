import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuthStore} from '../store/authStore';
import {useNavigation} from '@react-navigation/native';

export default function HomeScreen() {
  const {user} = useAuthStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, {paddingTop: insets.top + 16}]}>
      <Text style={styles.greeting}>
        Hello, {user?.firstName ?? 'there'} 👋
      </Text>
      <Text style={styles.role}>{user?.role?.replace('_', ' ')}</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Directory')}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardLabel}>Directory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Leave')}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardLabel}>Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Attendance')}>
          <Text style={styles.cardIcon}>⏱️</Text>
          <Text style={styles.cardLabel}>Clock In/Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.cardIcon}>⚙️</Text>
          <Text style={styles.cardLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 20},
  greeting: {fontSize: 24, fontWeight: '700', color: '#1a1a2e'},
  role: {fontSize: 14, color: '#888', marginBottom: 24, textTransform: 'capitalize'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 14},
  card: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {fontSize: 36, marginBottom: 10},
  cardLabel: {fontSize: 14, fontWeight: '600', color: '#333'},
});
