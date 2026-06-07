import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {leavesApi} from '../../api/leaves';
import {LeaveRequest} from '../../types';
import {formatDate} from '../../utils/dateUtils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#9ca3af',
};

export default function MyLeaveHistoryScreen() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leavesApi.myLeaves()
      .then(res => setLeaves(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const cancel = (id: string) => {
    Alert.alert('Cancel Leave', 'Cancel this leave request?', [
      {text: 'No'},
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await leavesApi.reject(id, 'Cancelled by employee');
            setLeaves(prev => prev.filter(l => l.id !== id));
          } catch {
            Alert.alert('Error', 'Could not cancel leave request.');
          }
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: LeaveRequest}) => (
    <View style={styles.card} testID={`leave-${item.id}`}>
      <View style={styles.cardHeader}>
        <Text style={styles.typeName}>{item.leaveTypeName}</Text>
        <View style={[styles.badge, {backgroundColor: STATUS_COLORS[item.status]}]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.dates}>
        {formatDate(item.startDate)} — {formatDate(item.endDate)}
      </Text>
      {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
      {item.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => cancel(item.id)}
          testID={`cancel-${item.id}`}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={leaves}
      keyExtractor={l => l.id}
      renderItem={renderItem}
      ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
      ListEmptyComponent={!loading ? <Text style={styles.empty}>No leave history</Text> : null}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 12},
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  typeName: {fontSize: 15, fontWeight: '600', color: '#222'},
  badge: {borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8},
  badgeText: {color: '#fff', fontSize: 11, fontWeight: '700'},
  dates: {fontSize: 13, color: '#666', marginBottom: 4},
  reason: {fontSize: 13, color: '#888', fontStyle: 'italic'},
  cancelBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  cancelBtnText: {color: '#ef4444', fontWeight: '600', fontSize: 13},
  loader: {marginVertical: 16},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
});
