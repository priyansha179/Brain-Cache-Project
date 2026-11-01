import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IP_ADDRESS = "192.168.1.10"; // ⚠️ Make sure this is your IP
const API_URL = `http://${IP_ADDRESS}:8000`;

export default function DashboardScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [dueDate, setDueDate] = useState(''); // Format: YYYY-MM-DD

  const fetchTasks = () => {
    setLoading(true);
    fetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => { setTasks(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    
    // Convert the text date to a format Python understands
    let formattedDate = null;
    if (dueDate.trim()) {
      formattedDate = `${dueDate.trim()}T00:00:00`; 
    }

    const newTask = { 
      title: newTitle, 
      description: "", 
      completed: false, 
      urgency_level: 2, 
      category: newCategory,
      due_date: formattedDate 
    };

    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    }).then(() => { 
      setNewTitle(''); 
      setDueDate('');
      fetchTasks(); 
    });
  };

  // The "PUT" request to mark a task complete
  const toggleComplete = (task: any) => {
    const updatedTask = { ...task, completed: !task.completed };
    
    fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    }).then(() => fetchTasks());
  };

  const handleDeleteTask = (id: number) => {
    fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' }).then(() => fetchTasks());
  };

  const pendingCount = tasks.filter((t: any) => !t.completed).length;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🧠 BrainCache</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Daily Overview</Text>
          <Text style={styles.statsNumber}>{pendingCount} Pending Tasks</Text>
        </View>

        {/* Add Task Form */}
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="What needs to be done?" value={newTitle} onChangeText={setNewTitle} />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Due Date Input (Simple Text for now) */}
        <TextInput 
          style={styles.dateInput} 
          placeholder="Due Date (e.g., 2026-12-10) [Optional]" 
          value={dueDate} 
          onChangeText={setDueDate} 
        />

        {/* Categories */}
        <View style={styles.categoryRow}>
          {['Work', 'Study', 'Personal'].map((cat) => (
            <TouchableOpacity key={cat} style={[styles.catButton, newCategory === cat && styles.catButtonActive]} onPress={() => setNewCategory(cat)}>
              <Text style={[styles.catText, newCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        <Text style={styles.sectionTitle}>Prioritized Tasks</Text>
        {loading ? <ActivityIndicator size="large" color="#4A90E2" /> : (
          tasks.map((task: any) => (
            <View key={task.id} style={[styles.card, task.completed && styles.cardCompleted]}>
              <View style={styles.cardHeader}>
                
                {/* Checkbox Area */}
                <TouchableOpacity onPress={() => toggleComplete(task)} style={styles.checkboxArea}>
                  <Ionicons 
                    name={task.completed ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={task.completed ? "#4A90E2" : "#888"} 
                  />
                  <Text style={[styles.cardTitle, task.completed && styles.textCompleted]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardCategory}>{task.category}</Text>
                {task.due_date && (
                  <Text style={styles.cardDate}>Due: {task.due_date.split('T')[0]}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  statsCard: { backgroundColor: '#4A90E2', padding: 20, borderRadius: 15, marginBottom: 20 },
  statsTitle: { color: 'white', fontSize: 16, opacity: 0.8 },
  statsNumber: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  inputContainer: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, elevation: 2 },
  addButton: { backgroundColor: '#4A90E2', width: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginLeft: 10 },
  addButtonText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  dateInput: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 14, elevation: 2 },
  categoryRow: { flexDirection: 'row', marginBottom: 20 },
  catButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 },
  catButtonActive: { backgroundColor: '#4A90E2' },
  catText: { color: '#666', fontWeight: '600' },
  catTextActive: { color: 'white' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#4A90E2' },
  cardCompleted: { opacity: 0.6, borderLeftColor: '#27ae60' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkboxArea: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },
  textCompleted: { textDecorationLine: 'line-through', color: '#888' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginLeft: 34 },
  cardCategory: { fontSize: 12, color: '#888', fontWeight: '500' },
  cardDate: { fontSize: 12, color: '#d35400', fontWeight: 'bold' },
});