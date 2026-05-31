import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {leavesApi} from '../../api/leaves';
import {LeaveRequest} from '../../types';
import {formatDate, formatDateForApi, weekBounds} from '../../utils/dateUtils';
import {addWeeks, subWeeks} from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#fde68a',
  APPROVED: '#bbf7d0',
  REJECTED: '#fecaca',
  CANCELLED: '#e5e7eb',
};

export default function TeamLeaveCalendarScreen() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {start, end} = weekBounds(currentWeek);
    setLoading(true);
    leavesApi
      .teamLeaves({startDate: start, endDate: end})
      .then(r => setLeaves(r.data.data))
      .finally(() => setLoading(false));
  }, [currentWeek]);

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

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {leaves.length === 0 ? (
            <Text style={styles.empty}>No team leaves this week</Text>
          ) : (
            leaves.map(leave => (
              <View
                key={leave.id}
                style={[styles.row, {backgroundColor: STATUS_COLORS[leave.status] ?? '#e5e7eb'}]}
                testID={`team-leave-${leave.id}`}>
                <Text style={styles.rowName}>{leave.employeeName}</Text>
                <View style={styles.rowRight}>
                  <Text style={styles.rowType}>{leave.leaveTypeName}</Text>
                  <Text style={styles.rowDates}>
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  content: {padding: 12},
  row: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowName: {fontSize: 14, fontWeight: '700', color: '#222', flex: 1},
  rowRight: {alignItems: 'flex-end'},
  rowType: {fontSize: 13, fontWeight: '600', color: '#444'},
  rowDates: {fontSize: 12, color: '#666', marginTop: 2},
  loader: {marginTop: 40},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
});
