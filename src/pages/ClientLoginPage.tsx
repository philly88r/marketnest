import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { clientLogin, isLoggedIn, isClient } from '../utils/authService';

const ClientLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if already logged in
  useEffect(() => {
    if (isLoggedIn() && isClient()) {
      // Get client ID from localStorage
      const clientUser = localStorage.getItem('client-user');
      if (clientUser) {
        const { id } = JSON.parse(clientUser);
        navigate(`/client-portal/${id}`);
      }
    }
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // clientLogin now returns clientUser with id
      const clientUser = await clientLogin(username, password);
      console.log('clientUser after login:', clientUser);
      if (!clientUser || !clientUser.id) {
        setError('Login succeeded but no client ID was returned. Please contact support.');
        setIsLoading(false);
        return;
      }
      navigate(`/client-portal/${clientUser.id}`);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LoginPageContainer>
      <Header />
      <LoginContent>
        <LoginCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoginHeader>
            <h2>Client Login</h2>
            <p>Sign in to access your client portal</p>
          </LoginHeader>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <LoginForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label style={{ color: 'red' }}>Email Address</Label>
              <Input 
                type="email" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Password</Label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </FormGroup>
            
            <LoginButton 
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </LoginButton>
          </LoginForm>
          
          <LoginFooter>
            <p>Need help?</p>
            <HelpText>
              Contact your account manager or email <strong>support@marketnest.org</strong> for assistance.
            </HelpText>
            <Note>For demonstration, you can use the sample client credentials from the database setup.</Note>
          </LoginFooter>
        </LoginCard>
      </LoginContent>
      <Footer />
    </LoginPageContainer>
  );
};

// Styled Components
const LoginPageContainer = styled.div`
  background: #0f0f1a;
  min-height: 100vh;
  color: white;
`;

const LoginContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 300px);
  padding: 120px 20px 80px;
`;

const LoginCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    margin: 0 0 10px;
    font-size: 28px;
    background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 67, 67, 0.1);
  border: 1px solid rgba(255, 67, 67, 0.3);
  color: #ff4343;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const LoginForm = styled.form`
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const LoginFooter = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  text-align: center;
  
  p {
    margin: 0 0 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }
`;

const HelpText = styled.div`
  background: rgba(31, 83, 255, 0.05);
  border: 1px solid rgba(31, 83, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
`;

const Note = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

export default ClientLoginPage;
