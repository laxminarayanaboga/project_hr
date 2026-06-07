import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {employeesApi} from '../../api/employees';
import {Employee, Department} from '../../types';
import {EmployeeListScreenProps} from '../../navigation/types';

export default function EmployeeListScreen({navigation}: EmployeeListScreenProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    employeesApi.departments().then(r => setDepartments(r.data.data));
  }, []);

  const fetchEmployees = useCallback(
    async (query: string, deptId: string | null, pg: number) => {
      setLoading(true);
      try {
        const response = await employeesApi.list({
          search: query || undefined,
          departmentId: deptId || undefined,
          page: pg,
          size: 20,
        });
        const {content, totalPages} = response.data.data;
        setEmployees(prev => (pg === 0 ? content : [...prev, ...content]));
        setHasMore(pg < totalPages - 1);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(0);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchEmployees(search, selectedDept, 0);
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search, selectedDept, fetchEmployees]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchEmployees(search, selectedDept, next);
    }
  };

  const renderEmployee = ({item}: {item: Employee}) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('EmployeeProfile', {employeeId: item.id})}
      testID={`employee-row-${item.id}`}>
      {item.avatarUrl ? (
        <Image source={{uri: item.avatarUrl}} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>
            {item.firstName[0]}{item.lastName[0]}
          </Text>
        </View>
      )}
      <View style={styles.rowInfo}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.sub}>{item.jobTitle || item.departmentName || ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name…"
        value={search}
        onChangeText={setSearch}
        testID="search-input"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsList}>
        {[{id: null, name: 'All'} as any, ...departments].map(dept => (
          <TouchableOpacity
            key={String(dept.id)}
            style={[styles.chip, selectedDept === dept.id && styles.chipActive]}
            onPress={() => setSelectedDept(dept.id)}
            activeOpacity={0.7}>
            <Text style={[styles.chipText, selectedDept === dept.id && styles.chipTextActive]}>
              {dept.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        style={styles.list}
        data={employees}
        keyExtractor={e => e.id}
        renderItem={renderEmployee}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No employees found</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f2f5'},
  searchInput: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },
  chipsList: {flexGrow: 0, flexShrink: 0},
  list: {flex: 1},
  chips: {paddingHorizontal: 12, paddingBottom: 8, gap: 8},
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  chipActive: {backgroundColor: '#4361ee'},
  chipText: {fontSize: 13, color: '#444'},
  chipTextActive: {color: '#fff'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  avatar: {width: 48, height: 48, borderRadius: 24},
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {color: '#fff', fontWeight: '700', fontSize: 16},
  rowInfo: {flex: 1},
  name: {fontSize: 15, fontWeight: '600', color: '#222'},
  sub: {fontSize: 13, color: '#888', marginTop: 2},
  loader: {marginVertical: 16},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
});
