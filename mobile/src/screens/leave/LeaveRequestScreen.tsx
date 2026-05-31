import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {leavesApi} from '../../api/leaves';
import {LeaveBalance, LeaveType} from '../../types';
import {formatDate, formatDateForApi} from '../../utils/dateUtils';
import {useNavigation} from '@react-navigation/native';

export default function LeaveRequestScreen() {
  const navigation = useNavigation<any>();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reason, setReason] = useState('');
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([leavesApi.types(), leavesApi.balances()]).then(
      ([typesRes, balancesRes]) => {
        setLeaveTypes(typesRes.data.data);
        setBalances(balancesRes.data.data);
        if (typesRes.data.data.length > 0) {
          setSelectedType(typesRes.data.data[0].id);
        }
      },
    );
  }, []);

  const selectedBalance = balances.find(b => b.leaveTypeId === selectedType);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a leave type.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date.');
      return;
    }
    setSubmitting(true);
    try {
      await leavesApi.submit({
        leaveTypeId: selectedType,
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        reason: reason || undefined,
      });
      Alert.alert('Submitted', 'Your leave request has been submitted.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Leave Type</Text>
      {leaveTypes.map(lt => (
        <TouchableOpacity
          key={lt.id}
          style={[styles.typeChip, selectedType === lt.id && styles.typeChipActive]}
          onPress={() => setSelectedType(lt.id)}
          testID={`type-${lt.id}`}>
          <Text style={[styles.typeChipText, selectedType === lt.id && styles.typeChipTextActive]}>
            {lt.name}
          </Text>
        </TouchableOpacity>
      ))}

      {selectedBalance && (
        <Text style={styles.balanceNote}>
          Balance: {selectedBalance.remainingDays} days remaining
        </Text>
      )}

      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStart(true)} testID="start-date-btn">
        <Text style={styles.dateBtnText}>{formatDate(startDate)}</Text>
      </TouchableOpacity>
      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowStart(false);
            if (date) {
              setStartDate(date);
              if (date > endDate) {
                setEndDate(date);
              }
            }
          }}
        />
      )}

      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEnd(true)} testID="end-date-btn">
        <Text style={styles.dateBtnText}>{formatDate(endDate)}</Text>
      </TouchableOpacity>
      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={startDate}
          onChange={(_, date) => {
            setShowEnd(false);
            if (date) {
              setEndDate(date);
            }
          }}
        />
      )}

      <Text style={styles.label}>Reason (optional)</Text>
      <TextInput
        style={styles.textarea}
        value={reason}
        onChangeText={setReason}
        placeholder="Reason for leave…"
        multiline
        numberOfLines={3}
        testID="reason-input"
      />

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        testID="submit-btn">
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Request</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 16},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 16,
  },
  typeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  typeChipActive: {backgroundColor: '#4361ee'},
  typeChipText: {color: '#333', fontWeight: '500'},
  typeChipTextActive: {color: '#fff'},
  balanceNote: {fontSize: 13, color: '#22c55e', fontWeight: '500', marginBottom: 4},
  dateBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateBtnText: {fontSize: 15, color: '#333'},
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {opacity: 0.7},
  submitBtnText: {color: '#fff', fontWeight: '700', fontSize: 16},
});
