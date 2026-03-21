async function testApi() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed:', loginRes.status);
      console.log(await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Login successful. Token:', token.substring(0, 15) + '...');
    
    console.log('Fetching users...');
    const usersRes = await fetch('http://localhost:3000/api/users?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Users Status:', usersRes.status);
    const usersData = await usersRes.json();
    console.log('Response body:', JSON.stringify(usersData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();
