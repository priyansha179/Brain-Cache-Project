import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Calendar</Text>
      <Text style={styles.subtitle}>Your upcoming schedule</Text>
      
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.dayCard}>
          <Text style={styles.dayText}>Today</Text>
          <View style={styles.event}>
            <Ionicons name="time-outline" size={16} color="#1565c0" style={{marginRight: 8}} />
            <Text style={styles.eventText}>Review BrainCache Proposal</Text>
          </View>
        </View>

        <View style={styles.dayCard}>
          <Text style={styles.dayText}>Tomorrow</Text>
          <View style={styles.event}>
            <Ionicons name="time-outline" size={16} color="#1565c0" style={{marginRight: 8}} />
            <Text style={styles.eventText}>Submit Sprint 2 Report</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  listContainer: { flex: 1 },
  dayCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 15, elevation: 2 },
  dayText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  event: { flexDirection: 'row', backgroundColor: '#e3f2fd', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#4A90E2', alignItems: 'center' },
  eventText: { color: '#1565c0', fontWeight: '500', fontSize: 15 }
});