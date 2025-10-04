export default function SigninPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          textAlign: 'center',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Signin Page
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Welcome back to ExpenseFlow
        </p>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="admin@expenseflow.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          Don't have an account?{' '}
          <a 
            href="/signup" 
            style={{ 
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Signup
          </a>
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.375rem',
          border: '1px solid #dbeafe'
        }}>
          <h3 style={{ 
            fontWeight: '600', 
            color: '#1e40af',
            marginBottom: '0.5rem',
            fontSize: '0.875rem'
          }}>
            Demo Credentials
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
            <p><strong>Email:</strong> admin@expenseflow.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
        </div>
      </div>
    </div>
  );
}