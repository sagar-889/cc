// Authentication Debug Utility
export const debugAuth = () => {
  console.log('=== AUTHENTICATION DEBUG ===');
  
  // Check localStorage
  const authStorage = localStorage.getItem('auth-storage');
  console.log('Raw auth-storage:', authStorage);
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('Parsed auth-storage:', parsed);
      console.log('User:', parsed.state?.user);
      console.log('Token:', parsed.state?.token ? 'Present' : 'Missing');
      console.log('User Role:', parsed.state?.user?.role);
    } catch (error) {
      console.error('Error parsing auth-storage:', error);
    }
  } else {
    console.log('No auth-storage found');
  }
  
  // Check if there are multiple auth entries
  console.log('\n=== ALL LOCALSTORAGE KEYS ===');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      console.log(`${key}: ${localStorage.getItem(key)}`);
    }
  }
};

export const clearAuth = () => {
  console.log('Clearing all authentication data...');
  
  // Clear specific auth keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  
  console.log('Authentication data cleared. Please refresh and login again.');
};

export const fixAuthRole = async () => {
  console.log('Attempting to fix authentication role...');
  
  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    console.log('No auth data found');
    return;
  }
  
  try {
    const parsed = JSON.parse(authStorage);
    const token = parsed.state?.token;
    
    if (!token) {
      console.log('No token found');
      return;
    }
    
    // Fetch fresh user data from backend
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('Fresh user data from backend:', userData);
      
      // Update localStorage with fresh data
      const newAuthData = {
        ...parsed,
        state: {
          ...parsed.state,
          user: userData.user
        }
      };
      
      localStorage.setItem('auth-storage', JSON.stringify(newAuthData));
      console.log('Updated auth data with fresh user info');
      console.log('New role:', userData.user?.role);
      
      return userData.user;
    } else {
      console.error('Failed to fetch user data:', response.status);
    }
  } catch (error) {
    console.error('Error fixing auth role:', error);
  }
};
