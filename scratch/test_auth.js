async function testAuth() {
  const baseUrl = 'http://localhost:3000/api/auth';
  const testUser = {
    username: 'testuser',
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    console.log('--- Testing Register ---');
    const registerRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    console.log('Register Response:', JSON.stringify(registerData, null, 2));

    if (!registerRes.ok) throw new Error(registerData.message);

    console.log('\n--- Testing Login ---');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();
