import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {leavesApi} from '../../api/leaves';
import {LeaveBalance} from '../../types';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';

export default function LeaveDashboardScreen() {
  const navigation = useNavigation<any>();
  const {user} = useAuthStore();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leavesApi
      .balances()
      .then(r => setBalances(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const isManager = user?.role === 'MANAGER' || user?.role === 'HR_ADMIN';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Leave</Text>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('LeaveRequest')}>
          <Text style={styles.primaryBtnText}>+ Request Leave</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MyLeaveHistory')}>
          <Text style={styles.secondaryBtnText}>My History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('TeamLeaveCalendar')}>
          <Text style={styles.secondaryBtnText}>Team Calendar</Text>
        </TouchableOpacity>
        {isManager && (
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.approvalBtn]}
            onPress={() => navigation.navigate('LeaveApprovalQueue')}>
            <Text style={styles.secondaryBtnText}>Approval Queue</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>My Leave Balances</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        balances.map(b => (
          <View key={b.leaveTypeId} style={styles.balanceCard}>
            <Text style={styles.balanceName}>{b.leaveTypeName}</Text>
            <View style={styles.balanceRow}>
              <BalanceStat label="Total" value={b.totalDays} />
              <BalanceStat label="Used" value={b.usedDays} />
              <BalanceStat label="Remaining" value={b.remainingDays} color="#22c55e" />
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${(b.usedDays / b.totalDays) * 100}%`},
                ]}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function BalanceStat({
  label,
  value,
  color = '#333',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <View style={{alignItems: 'center'}}>
      <Text style={{fontSize: 20, fontWeight: '700', color}}>{value}</Text>
      <Text style={{fontSize: 12, color: '#888'}}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 16},
  heading: {fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 16},
  quickActions: {gap: 10, marginBottom: 24},
  primaryBtn: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  primaryBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},
  secondaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  approvalBtn: {borderColor: '#f59e0b'},
  secondaryBtnText: {fontWeight: '600', color: '#333', fontSize: 14},
  sectionTitle: {fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 12},
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  balanceName: {fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10},
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {height: '100%', backgroundColor: '#4361ee', borderRadius: 3},
  loader: {marginTop: 24},
});
