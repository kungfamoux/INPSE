import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Generic database query helper
export const queryDatabase = async (table, options = {}) => {
  try {
    let query = supabase.from(table);

    // Select columns
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    // Apply search
    if (options.search) {
      Object.entries(options.search).forEach(([key, value]) => {
        query = query.ilike(key, `%${value}%`);
      });
    }

    // Apply ordering
    if (options.order) {
      Object.entries(options.order).forEach(([column, direction]) => {
        query = query.order(column, { ascending: direction === 'asc' });
      });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Single or multiple
    if (options.single) {
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error(`Database query error for table ${table}:`, error);
    throw error;
  }
};

// Insert record helper
export const insertRecord = async (table, data, options = {}) => {
  try {
    let query = supabase.from(table).insert([data]);

    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    if (options.single) {
      const { data: result, error } = await query.single();
      if (error) throw error;
      return result;
    } else {
      const { data: result, error } = await query;
      if (error) throw error;
      return result;
    }
  } catch (error) {
    console.error(`Insert error for table ${table}:`, error);
    throw error;
  }
};

// Update record helper
export const updateRecord = async (table, id, data, options = {}) => {
  try {
    let query = supabase.from(table).update(data).eq('id', id);

    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    if (options.single) {
      const { data: result, error } = await query.single();
      if (error) throw error;
      return result;
    } else {
      const { data: result, error } = await query;
      if (error) throw error;
      return result;
    }
  } catch (error) {
    console.error(`Update error for table ${table}, id ${id}:`, error);
    throw error;
  }
};

// Delete record helper
export const deleteRecord = async (table, id) => {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return { message: 'Record deleted successfully' };
  } catch (error) {
    console.error(`Delete error for table ${table}, id ${id}:`, error);
    throw error;
  }
};

// Count records helper
export const countRecords = async (table, filters = {}) => {
  try {
    let query = supabase.from(table, { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { count, error } = await query;
    if (error) throw error;
    return count;
  } catch (error) {
    console.error(`Count error for table ${table}:`, error);
    throw error;
  }
};

// Check if record exists
export const recordExists = async (table, filters) => {
  try {
    const count = await countRecords(table, filters);
    return count > 0;
  } catch (error) {
    console.error(`Exists check error for table ${table}:`, error);
    throw error;
  }
};

// Get current academic session
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting current session:', error);
    throw error;
  }
};

// Get current term
export const getCurrentTerm = async () => {
  try {
    const { data, error } = await supabase
      .from('terms')
      .select(`
        *,
        sessions(name)
      `)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting current term:', error);
    throw error;
  }
};

// Get system settings
export const getSystemSetting = async (key) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();
    
    if (error) throw error;
    return data?.setting_value;
  } catch (error) {
    console.error(`Error getting system setting ${key}:`, error);
    throw error;
  }
};

// Update system setting
export const updateSystemSetting = async (key, value, userId) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error);
    throw error;
  }
};

export default supabase;
