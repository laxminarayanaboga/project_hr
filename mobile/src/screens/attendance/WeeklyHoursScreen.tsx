import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {attendanceApi} from '../../api/attendance';
import {AttendanceRecord} from '../../types';
import {formatDate, formatTime, weekBounds} from '../../utils/dateUtils';
import {addWeeks, subWeeks} from 'date-fns';

export default function WeeklyHoursScreen() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {start, end} = weekBounds(currentWeek);
    setLoading(true);
    attendanceApi
      .history({startDate: start, endDate: end})
      .then(r => setRecords(r.data.data))
      .finally(() => setLoading(false));
  }, [currentWeek]);

  const totalHours = records.reduce((acc, r) => acc + (r.hoursWorked ?? 0), 0);
  const {start, end} = weekBounds(currentWeek);

  return (
    <View style={styles.container}>
      <View style={styles.weekNav}>
        <TouchableOpacity
          onPress={() => setCurrentWeek(w => subWeeks(w, 1))}
          style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {formatDate(start)} – {formatDate(end)}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentWeek(w => addWeeks(w, 1))}
          style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total this week</Text>
        <Text style={styles.totalValue}>{totalHours.toFixed(1)}h</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={r => r.id}
          renderItem={({item}) => (
            <View style={styles.row} testID={`record-${item.id}`}>
              <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
              <View style={styles.rowTimes}>
                <Text style={styles.rowTime}>
                  In: {item.clockInTime ? formatTime(item.clockInTime) : '—'}
                </Text>
                <Text style={styles.rowTime}>
                  Out: {item.clockOutTime ? formatTime(item.clockOutTime) : '—'}
                </Text>
              </View>
              <Text style={styles.rowHours}>
                {item.hoursWorked != null ? `${item.hoursWorked.toFixed(1)}h` : '—'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            !loading ? <Text style={styles.empty}>No attendance records this week</Text> : null
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navBtn: {padding: 8},
  navBtnText: {fontSize: 22, color: '#4361ee'},
  weekLabel: {fontSize: 14, fontWeight: '600', color: '#333'},
  totalCard: {
    backgroundColor: '#4361ee',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  totalLabel: {color: 'rgba(255,255,255,0.7)', fontSize: 13},
  totalValue: {color: '#fff', fontSize: 36, fontWeight: '800'},
  list: {padding: 12},
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDate: {fontSize: 14, fontWeight: '600', color: '#222', flex: 1},
  rowTimes: {flex: 2},
  rowTime: {fontSize: 12, color: '#666'},
  rowHours: {fontSize: 15, fontWeight: '700', color: '#4361ee'},
  loader: {marginTop: 40},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
});
