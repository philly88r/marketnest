import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple admin authentication - in a real app, this would be handled securely
    if (username === 'admin' && password === 'marketnest2025') {
      // Successful login
      navigate('/admin-portal');
    } else {
      setError('Invalid username or password');
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
            <h2>Admin Login</h2>
            <p>Sign in to access the admin portal</p>
          </LoginHeader>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <LoginForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Username</Label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
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
            >
              Sign In
            </LoginButton>
          </LoginForm>
          
          <LoginFooter>
            <p>Admin credentials:</p>
            <CredentialsInfo>
              <div>Username: <strong>admin</strong></div>
              <div>Password: <strong>marketnest2025</strong></div>
            </CredentialsInfo>
            <Note>Note: In a production environment, this information would not be displayed.</Note>
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

const CredentialsInfo = styled.div`
  background: rgba(31, 83, 255, 0.05);
  border: 1px solid rgba(31, 83, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  text-align: left;
  
  div {
    margin-bottom: 5px;
    font-size: 14px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const Note = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

export default AdminLoginPage;
