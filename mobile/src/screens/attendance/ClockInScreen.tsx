import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
import {attendanceApi} from '../../api/attendance';
import {locationService} from '../../services/locationService';
import {AttendanceRecord} from '../../types';
import {formatTime, getHoursWorked} from '../../utils/dateUtils';
import {useNavigation} from '@react-navigation/native';

export default function ClockInScreen() {
  const navigation = useNavigation<any>();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [captureLocation, setCaptureLocation] = useState(true);
  const [elapsed, setElapsed] = useState('');

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.today();
      setRecord(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    if (!record?.clockInTime || record.clockOutTime) {
      return;
    }
    const interval = setInterval(() => {
      setElapsed(getHoursWorked(record.clockInTime));
    }, 60000);
    setElapsed(getHoursWorked(record.clockInTime));
    return () => clearInterval(interval);
  }, [record]);

  const clockedIn = !!record?.clockInTime && !record?.clockOutTime;

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      let coords: {latitude?: number; longitude?: number} | undefined;
      if (captureLocation) {
        const allowed = await locationService.requestPermission();
        if (allowed) {
          const pos = await locationService.getCurrentPosition();
          if (pos) {
            coords = pos;
          }
        }
      }
      const res = await attendanceApi.clockIn(coords);
      setRecord(res.data.data);
    } catch {
      Alert.alert('Error', 'Could not clock in. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceApi.clockOut();
      setRecord(res.data.data);
    } catch {
      Alert.alert('Error', 'Could not clock out. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusBadge}>
        <View style={[styles.dot, {backgroundColor: clockedIn ? '#22c55e' : '#9ca3af'}]} />
        <Text style={styles.statusText}>{clockedIn ? 'Clocked In' : 'Not Clocked In'}</Text>
      </View>

      {clockedIn && (
        <View style={styles.elapsedBox}>
          <Text style={styles.elapsedLabel}>Time so far</Text>
          <Text style={styles.elapsedValue}>{elapsed}</Text>
        </View>
      )}

      {record && (
        <View style={styles.shiftCard}>
          <Text style={styles.shiftTitle}>Today's Shift</Text>
          <ShiftRow label="Clock In" value={record.clockInTime ? formatTime(record.clockInTime) : '—'} />
          <ShiftRow
            label="Clock Out"
            value={record.clockOutTime ? formatTime(record.clockOutTime) : '—'}
          />
          {record.hoursWorked != null && (
            <ShiftRow label="Hours" value={`${record.hoursWorked.toFixed(1)}h`} />
          )}
          {record.clockInLatitude && (
            <ShiftRow
              label="Location"
              value={`${record.clockInLatitude.toFixed(4)}, ${record.clockInLongitude?.toFixed(4)}`}
            />
          )}
        </View>
      )}

      {!clockedIn && !record?.clockOutTime && (
        <View style={styles.locationToggle}>
          <Text style={styles.locationLabel}>Capture location</Text>
          <Switch
            value={captureLocation}
            onValueChange={setCaptureLocation}
            trackColor={{false: '#ccc', true: '#4361ee'}}
            testID="location-toggle"
          />
        </View>
      )}

      {!record?.clockOutTime && (
        <TouchableOpacity
          style={[
            styles.clockBtn,
            clockedIn ? styles.clockOutBtn : styles.clockInBtn,
            actionLoading && styles.clockBtnDisabled,
          ]}
          onPress={clockedIn ? handleClockOut : handleClockIn}
          disabled={actionLoading}
          testID="clock-btn">
          {actionLoading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.clockBtnText}>
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.weeklyBtn}
        onPress={() => navigation.navigate('WeeklyHours')}>
        <Text style={styles.weeklyBtnText}>View Weekly Hours →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ShiftRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.shiftRow}>
      <Text style={styles.shiftLabel}>{label}</Text>
      <Text style={styles.shiftValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 20, alignItems: 'center'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {width: 12, height: 12, borderRadius: 6},
  statusText: {fontSize: 16, fontWeight: '600', color: '#444'},
  elapsedBox: {alignItems: 'center', marginBottom: 16},
  elapsedLabel: {fontSize: 13, color: '#888'},
  elapsedValue: {fontSize: 36, fontWeight: '800', color: '#1a1a2e'},
  shiftCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  shiftTitle: {fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12},
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shiftLabel: {fontSize: 14, color: '#888'},
  shiftValue: {fontSize: 14, color: '#222', fontWeight: '500'},
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  locationLabel: {fontSize: 14, color: '#333'},
  clockBtn: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 24,
  },
  clockInBtn: {backgroundColor: '#22c55e'},
  clockOutBtn: {backgroundColor: '#ef4444'},
  clockBtnDisabled: {opacity: 0.7},
  clockBtnText: {color: '#fff', fontWeight: '800', fontSize: 20},
  weeklyBtn: {padding: 10},
  weeklyBtnText: {color: '#4361ee', fontWeight: '600', fontSize: 14},
});
