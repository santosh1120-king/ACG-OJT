import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Read the Google application ID from the frontend environment settings.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    // Give Google's credential to the backend, then move the user into the app.
    try {
      await login(response.credential);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const detail = error.response?.data?.detail;
      alert(detail ? `Login failed: ${detail}` : 'Login failed. Please try again.');
    }
  };

  const handleError = () => {
    // Show a simple browser message when Google sign-in cannot complete.
    console.error('Google Login Failed');
    alert('Google Login Failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>ACG OJT</h1>
          <p style={styles.subtitle}>Sign in to continue</p>
          <div style={styles.buttonWrapper}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    minWidth: '320px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#666',
    fontSize: '14px',
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
};
