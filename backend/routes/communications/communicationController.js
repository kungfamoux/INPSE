import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Message Management
export const getMessages = async (req, res) => {
  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_users(first_name, last_name, email, role),
        receiver:receiver_users(first_name, last_name, email, role)
      `)
      .order('created_at', { ascending: false });

    // Users can only see messages they sent or received
    query = query.or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`);

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { receiver_id, subject, content, message_type } = req.body;
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: req.user.id,
        receiver_id,
        subject,
        content,
        message_type
      }])
      .select(`
        *,
        sender:sender_users(first_name, last_name, email, role),
        receiver:receiver_users(first_name, last_name, email, role)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Users can only update messages they sent
    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .eq('sender_id', req.user.id)
      .select(`
        *,
        sender:sender_users(first_name, last_name, email, role),
        receiver:receiver_users(first_name, last_name, email, role)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only delete messages they sent
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('sender_id', req.user.id);
    
    if (error) throw error;
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_users(first_name, last_name, email, role),
        receiver:receiver_users(first_name, last_name, email, role)
      `)
      .or(`and(sender_id.eq.${req.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${req.user.id})`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id)
      .eq('receiver_id', req.user.id)
      .select(`
        *,
        sender:sender_users(first_name, last_name, email, role),
        receiver:receiver_users(first_name, last_name, email, role)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_users(first_name, last_name, email, role),
        receiver:receiver_users(first_name, last_name, email, role)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${req.user.id}),and(sender_id.eq.${req.user.id},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching messages by user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Announcement Management
export const getAnnouncements = async (req, res) => {
  try {
    let query = supabase
      .from('announcements')
      .select(`
        *,
        author:users(first_name, last_name, email, role)
      `)
      .order('created_at', { ascending: false });

    // Filter by published status (non-admin users only see published announcements)
    if (!['admin', 'proprietor'].includes(req.user.role)) {
      query = query.eq('is_published', true);
    }

    // Filter by target audience
    const userRole = req.user.role;
    const applicableAudiences = ['all', userRole];
    if (userRole === 'teacher') {
      applicableAudiences.push('students', 'staff');
    }
    
    query = query.in('target_audience', applicableAudiences);

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_audience, priority, expires_at } = req.body;
    
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        title,
        content,
        target_audience,
        priority: priority || 'normal',
        author_id: req.user.id,
        expires_at
      }])
      .select(`
        *,
        author:users(first_name, last_name, email, role)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Users can only update announcements they created (except admins)
    let query = supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id);

    if (!['admin', 'proprietor'].includes(req.user.role)) {
      query = query.eq('author_id', req.user.id);
    }
    
    const { data, error } = await query
      .select(`
        *,
        author:users(first_name, last_name, email, role)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only delete announcements they created (except admins)
    let query = supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (!['admin', 'proprietor'].includes(req.user.role)) {
      query = query.eq('author_id', req.user.id);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: error.message });
  }
};

export const publishAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('announcements')
      .update({ 
        is_published: true, 
        published_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select(`
        *,
        author:users(first_name, last_name, email, role)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error publishing announcement:', error);
    res.status(500).json({ error: error.message });
  }
};
