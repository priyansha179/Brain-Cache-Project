import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IP_ADDRESS = "192.168.1.10"; // ⚠️ UPDATE IF YOUR IP CHANGED
const API_URL = `http://${IP_ADDRESS}:8000`;

export default function ChatScreen() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userMessage.text })
    })
    .then(res => res.json())
    .then(data => {
      setMessages(prev => [...prev, { role: 'ai', text: data.ai_response }]);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Could not connect to backend." }]);
      setLoading(false);
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>🧠 AI Chat</Text>
      
      <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
        {messages.length === 0 && <Text style={styles.emptyText}>Ask me anything about your notes!</Text>}
        
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && <Text style={styles.loadingText}>BrainCache is thinking...</Text>}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Ask about your notes..." value={query} onChangeText={setQuery} multiline />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  chatContainer: { flex: 1, marginBottom: 15 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 50 },
  messageBubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: '#4A90E2', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 2, elevation: 1 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: 'white' },
  aiText: { color: '#333' },
  loadingText: { color: '#888', fontStyle: 'italic', marginLeft: 10 },
  inputContainer: { flexDirection: 'row', paddingBottom: 20 },
  input: { flex: 1, backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20, fontSize: 16, elevation: 2, maxHeight: 100 },
  sendButton: { backgroundColor: '#4A90E2', width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 25, marginLeft: 10, alignSelf: 'flex-end' }
});