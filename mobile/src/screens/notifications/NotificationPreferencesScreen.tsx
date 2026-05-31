import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Switch, ScrollView} from 'react-native';
import {
  useNotificationStore,
  NotificationPreferences,
} from '../../store/notificationStore';

interface PrefRow {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

const PREF_ROWS: PrefRow[] = [
  {
    key: 'leaveApproved',
    label: 'Leave Approved',
    description: 'When your leave request is approved',
  },
  {
    key: 'leaveRejected',
    label: 'Leave Rejected',
    description: 'When your leave request is rejected',
  },
  {
    key: 'leaveSubmitted',
    label: 'Leave Submitted',
    description: 'When a team member submits a leave request',
  },
  {
    key: 'reviewReminders',
    label: 'Review Reminders',
    description: 'Reminders about upcoming performance reviews',
  },
];

export default function NotificationPreferencesScreen() {
  const {prefs, load, update} = useNotificationStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Choose which events send you a push notification.
      </Text>
      {PREF_ROWS.map(row => (
        <View key={row.key} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowDesc}>{row.description}</Text>
          </View>
          <Switch
            value={prefs[row.key]}
            onValueChange={val => update({[row.key]: val})}
            trackColor={{false: '#ccc', true: '#4361ee'}}
            testID={`switch-${row.key}`}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 16},
  intro: {fontSize: 14, color: '#888', marginBottom: 16},
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {flex: 1, marginRight: 16},
  rowLabel: {fontSize: 15, fontWeight: '600', color: '#222'},
  rowDesc: {fontSize: 13, color: '#888', marginTop: 2},
});
