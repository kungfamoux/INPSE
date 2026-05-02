import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'admin123';
    const password_hash = await bcrypt.hash(password, 10);

    // Create admin user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: 'admin@inpse.com',
        password_hash,
        first_name: 'System',
        last_name: 'Administrator',
        phone: '+234 XXX XXX XXXX',
        role: 'admin',
        is_active: true,
        is_approved: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@inpse.com');
    console.log('🔑 Password: admin123');
    console.log('👤 User ID:', data.id);

    // Test login
    console.log('\n🧪 Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@inpse.com',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('🎫 JWT Token:', loginResult.token.substring(0, 50) + '...');
      console.log('👤 User:', loginResult.user.first_name, loginResult.user.last_name);
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
