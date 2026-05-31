import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import {employeesApi} from '../../api/employees';
import {Employee} from '../../types';
import {EmployeeProfileScreenProps} from '../../navigation/types';

export default function EmployeeProfileScreen({route}: EmployeeProfileScreenProps) {
  const {employeeId} = route.params;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeesApi
      .get(employeeId)
      .then(r => setEmployee(r.data.data))
      .catch(() => Alert.alert('Error', 'Could not load employee profile.'))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const callPhone = () => {
    if (employee?.phone) {
      Linking.openURL(`tel:${employee.phone}`).catch(() =>
        Alert.alert('Error', 'Cannot open phone app.'),
      );
    }
  };

  const sendEmail = () => {
    if (employee?.email) {
      Linking.openURL(`mailto:${employee.email}`).catch(() =>
        Alert.alert('Error', 'Cannot open mail app.'),
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.center}>
        <Text>Employee not found.</Text>
      </View>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {employee.avatarUrl ? (
          <Image source={{uri: employee.avatarUrl}} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {employee.firstName[0]}{employee.lastName[0]}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{fullName}</Text>
        {employee.jobTitle && <Text style={styles.jobTitle}>{employee.jobTitle}</Text>}
        {employee.departmentName && (
          <Text style={styles.dept}>{employee.departmentName}</Text>
        )}
      </View>

      <View style={styles.actions}>
        {employee.phone && (
          <TouchableOpacity style={styles.actionBtn} onPress={callPhone} testID="call-btn">
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={sendEmail} testID="email-btn">
          <Text style={styles.actionIcon}>✉️</Text>
          <Text style={styles.actionLabel}>Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <InfoRow label="Email" value={employee.email} />
        {employee.phone && <InfoRow label="Phone" value={employee.phone} />}
        <InfoRow label="Status" value={employee.employmentStatus} />
      </View>
    </ScrollView>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  content: {padding: 20},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {alignItems: 'center', marginBottom: 24},
  avatar: {width: 90, height: 90, borderRadius: 45, marginBottom: 12},
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitials: {color: '#fff', fontSize: 28, fontWeight: '700'},
  name: {fontSize: 22, fontWeight: '700', color: '#1a1a2e'},
  jobTitle: {fontSize: 15, color: '#555', marginTop: 4},
  dept: {fontSize: 13, color: '#888', marginTop: 2},
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {fontSize: 24, marginBottom: 4},
  actionLabel: {fontSize: 13, fontWeight: '500', color: '#333'},
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {fontSize: 14, color: '#888', fontWeight: '500'},
  infoValue: {fontSize: 14, color: '#222', maxWidth: '60%', textAlign: 'right'},
});
