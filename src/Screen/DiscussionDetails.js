import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

/* ---------- Responsive helpers ---------- */
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const getResponsiveSize = size => {
  if (width < 375) return size * 0.85;
  if (width > 414) return size * 1.1;
  return size;
};

const DiscussionChat = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { discussionId } = route.params || {};

  /* ---------- STATES ---------- */
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 🔹 EDIT STATE
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');

  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets();

  /* ---------- FETCH USER ---------- */
  useEffect(() => {
    const getUser = async () => {
      const uid = await AsyncStorage.getItem('user_id');
      setCurrentUserId(uid);
    };
    getUser();
  }, []);

  /* ---------- FETCH MESSAGES ---------- */
  useEffect(() => {
    if (discussionId) fetchMessages();
  }, [discussionId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');

      const res = await axios.get(
        `https://fornix-medical.vercel.app/api/v1/mobile/discussions/${discussionId}/posts`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (res.data.success) {
        setMessages(
          res.data.data.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          )
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CHECK CURRENT USER MESSAGE ---------- */
  const isCurrentUserMessage = message =>
    message.user_id === currentUserId;

  /* ---------- LONG PRESS ACTION ---------- */
  const openMessageOptions = message => {
    Alert.alert(
      'Message Options',
      '',
      [
        {
          text: 'Edit',
          onPress: () => {
            setEditingMessage(message);
            setEditText(message.content);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMessage(message),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const sendNewMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const token = await AsyncStorage.getItem('authToken');

      const res = await axios.post(
        `https://fornix-medical.vercel.app/api/v1/mobile/discussions/${discussionId}/posts`,
        {
          user_id: currentUserId,
          content: newMessage.trim(),
          parent_id: null,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (res.data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: res.data.post_id,
            user_id: currentUserId,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            edited: false,
          },
        ]);

        setNewMessage('');
        
        // Scroll to bottom after sending message
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  /* ---------- UPDATE MESSAGE ---------- */
  const updateMessage = async () => {
    if (!editText.trim()) return;

    try {
      const token = await AsyncStorage.getItem('authToken');

      await axios.put(
        `https://fornix-medical.vercel.app/api/v1/mobile/discussions/posts/${editingMessage.id}`,
        {
          user_id: currentUserId,
          content: editText.trim(),
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessage.id
            ? { ...msg, content: editText, edited: true }
            : msg
        )
      );

      setEditingMessage(null);
      setEditText('');
    } catch {
      Alert.alert('Error', 'Failed to update message');
    }
  };

  /* ---------- DELETE MESSAGE ---------- */
  const deleteMessage = async message => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      await axios.delete(
        `https://fornix-medical.vercel.app/api/v1/mobile/discussions/posts/${message.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          data: {
            user_id: currentUserId,
          },
        }
      );

      setMessages(prev => prev.filter(m => m.id !== message.id));
    } catch {
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  /* ---------- SEND / UPDATE HANDLER ---------- */
  const handleSend = () => {
    if (editingMessage) {
      updateMessage();   // ✏️ Edit mode
    } else {
      sendNewMessage();  // 📤 New message
    }
  };

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#F87F16" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon1 name="chevron-back" size={moderateScale(24)} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Discussion</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>

          {/* Messages List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScrollView}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="comments" size={moderateScale(60)} color="#ddd" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Start the conversation!</Text>
              </View>
            ) : (
              messages.map(message => {
                const isMine = isCurrentUserMessage(message);
                const messageTime = new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });

                return (
                  <TouchableOpacity
                    key={message.id}
                    activeOpacity={0.8}
                    onLongPress={() => {
                      if (isMine) openMessageOptions(message);
                    }}
                    style={[
                      styles.messageWrapper,
                      isMine ? styles.currentUserWrapper : styles.otherUserWrapper,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMine ? styles.currentUserBubble : styles.otherUserBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMine ? styles.currentUserText : styles.otherUserText,
                        ]}
                      >
                        {message.content}
                      </Text>
                      
                      <View style={styles.messageFooter}>
                        <Text style={[
                          styles.messageTime,
                          isMine ? styles.currentUserTime : styles.otherUserTime
                        ]}>
                          {messageTime}
                        </Text>
                        {message.edited && (
                          <Text style={styles.editedText}> • Edited</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Input Container */}
          {editingMessage && (
            <View style={styles.editIndicator}>
              <Text style={styles.editIndicatorText}>Editing message...</Text>
              <TouchableOpacity 
                onPress={() => {
                  setEditingMessage(null);
                  setEditText('');
                }}
                style={styles.cancelEditButton}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={editingMessage ? editText : newMessage}
              onChangeText={t =>
                editingMessage ? setEditText(t) : setNewMessage(t)
              }
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (editingMessage ? !editText.trim() : !newMessage.trim()) && styles.sendButtonDisabled
              ]} 
              onPress={handleSend}
              disabled={editingMessage ? !editText.trim() : !newMessage.trim()}
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon 
                  name={editingMessage ? "check" : "paper-plane"} 
                  color="#fff" 
                  size={moderateScale(18)} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

/* ---------- STYLES (RESPONSIVE) ---------- */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  innerContainer: {
    flex: 1,
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: moderateScale(8),
    marginLeft: moderateScale(-8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: moderateScale(40),
  },

  // Messages Scroll
  messagesScrollView: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(20),
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  emptyText: {
    fontSize: moderateScale(18),
    color: '#999',
    marginTop: moderateScale(16),
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: moderateScale(14),
    color: '#bbb',
    marginTop: moderateScale(4),
  },

  // Message Wrapper
  messageWrapper: {
    marginBottom: moderateScale(12),
    maxWidth: '80%',
  },
  currentUserWrapper: {
    alignSelf: 'flex-end',
  },
  otherUserWrapper: {
    alignSelf: 'flex-start',
  },

  // Message Bubble
  messageBubble: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(20),
  },
  currentUserBubble: { 
    backgroundColor: '#F87F16',
    borderBottomRightRadius: moderateScale(4),
  },
  otherUserBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: moderateScale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Message Text
  messageText: { 
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  currentUserText: { 
    color: '#fff' 
  },
  otherUserText: { 
    color: '#333' 
  },

  // Message Footer
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(4),
  },
  messageTime: {
    fontSize: moderateScale(10),
    opacity: 0.8,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTime: {
    color: '#666',
  },
  editedText: {
    fontSize: moderateScale(10),
    fontStyle: 'italic',
    color: '#999',
  },

  // Edit Indicator
  editIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  editIndicatorText: {
    fontSize: moderateScale(14),
    color: '#E65100',
    fontWeight: '500',
  },
  cancelEditButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(15),
    backgroundColor: '#FFE0B2',
  },
  cancelEditText: {
    fontSize: moderateScale(12),
    color: '#E65100',
    fontWeight: '500',
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(12),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(Platform.OS === 'ios' ? 12 : 8),
    fontSize: moderateScale(14),
    maxHeight: moderateScale(100),
    marginRight: moderateScale(8),
  },
  sendButton: {
    backgroundColor: '#F87F16',
    borderRadius: moderateScale(25),
    width: moderateScale(50),
    height: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#FFB74D',
    opacity: 0.6,
  },
});

export default DiscussionChat;