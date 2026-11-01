import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IP_ADDRESS = "192.168.1.10"; // ⚠️ UPDATE IF YOUR IP CHANGED
const API_URL = `http://${IP_ADDRESS}:8000`;

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = () => {
    setLoading(true);
    fetch(`${API_URL}/notes`).then(res => res.json()).then(data => { setNotes(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleAddNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, content: newContent })
    }).then(() => { setNewTitle(''); setNewContent(''); fetchNotes(); });
  };

  const handleDeleteNote = (id: number) => {
    fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' }).then(() => fetchNotes());
  };

  // Filter notes based on the search bar
  const displayedNotes = notes.filter((note: any) => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>📝 Notes Engine</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search your notes..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Note Form */}
      <View style={styles.formContainer}>
        <TextInput style={styles.inputTitle} placeholder="Note Title" value={newTitle} onChangeText={setNewTitle} />
        <TextInput style={styles.inputContent} placeholder="Write your note here..." value={newContent} onChangeText={setNewContent} multiline />
        <TouchableOpacity style={styles.saveButton} onPress={handleAddNote}>
          <Text style={styles.saveButtonText}>Save to BrainCache</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#27ae60" /> : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {displayedNotes.map((note: any) => (
            <View key={note.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{note.title}</Text>
                <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardContent} numberOfLines={3}>{note.content}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', marginBottom: 20, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  formContainer: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  inputTitle: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
  inputContent: { fontSize: 16, color: '#444', height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  listContainer: { flex: 1 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#27ae60' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardContent: { fontSize: 14, color: '#666', lineHeight: 20 }
});