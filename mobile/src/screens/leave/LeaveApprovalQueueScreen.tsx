import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {leavesApi} from '../../api/leaves';
import {LeaveRequest} from '../../types';
import {formatDate} from '../../utils/dateUtils';

export default function LeaveApprovalQueueScreen() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await leavesApi.pending();
      setRequests(res.data.data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openAction = (id: string, type: 'approve' | 'reject') => {
    setActionId(id);
    setActionType(type);
    setComment('');
  };

  const confirmAction = async () => {
    if (!actionId || !actionType) {
      return;
    }
    setSubmitting(true);
    try {
      if (actionType === 'approve') {
        await leavesApi.approve(actionId, comment || undefined);
      } else {
        await leavesApi.reject(actionId, comment || undefined);
      }
      setRequests(prev => prev.filter(r => r.id !== actionId));
      setActionId(null);
      setActionType(null);
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({item}: {item: LeaveRequest}) => (
    <View style={styles.card} testID={`request-${item.id}`}>
      <Text style={styles.empName}>{item.employeeName}</Text>
      <Text style={styles.typeDates}>
        {item.leaveTypeName} · {formatDate(item.startDate)} – {formatDate(item.endDate)}
      </Text>
      {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => openAction(item.id, 'approve')}
          testID={`approve-${item.id}`}>
          <Text style={styles.approveBtnText}>✓ Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => openAction(item.id, 'reject')}
          testID={`reject-${item.id}`}>
          <Text style={styles.rejectBtnText}>✗ Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={r => r.id}
        renderItem={renderItem}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No pending requests</Text> : null}
        contentContainerStyle={styles.content}
      />

      <Modal visible={!!actionId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Leave
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
              testID="comment-input"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setActionId(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, actionType === 'reject' && styles.modalReject]}
                onPress={confirmAction}
                disabled={submitting}
                testID="confirm-action-btn">
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  empName: {fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4},
  typeDates: {fontSize: 13, color: '#555', marginBottom: 4},
  reason: {fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 8},
  rowActions: {flexDirection: 'row', gap: 10, marginTop: 8},
  approveBtn: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  approveBtnText: {color: '#15803d', fontWeight: '700'},
  rejectBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  rejectBtnText: {color: '#dc2626', fontWeight: '700'},
  loader: {marginVertical: 16},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 16},
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {flexDirection: 'row', gap: 12},
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: {color: '#555', fontWeight: '600'},
  modalConfirm: {
    flex: 1,
    backgroundColor: '#4361ee',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalReject: {backgroundColor: '#ef4444'},
  modalConfirmText: {color: '#fff', fontWeight: '700'},
});
