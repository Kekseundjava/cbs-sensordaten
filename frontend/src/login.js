import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';  // Import the CSS file
import { SensorDataController } from './Controller.js';

//import './Contoller.js';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [text, settext] = useState('');
  const navigate = useNavigate();
  const controller = new SensorDataController({});

  const handleSubmit = async (e) => {

    e.preventDefault();
    if(await controller.tryLogin(username, password) == true){
        onLogin(username, password);
        navigate('/data');
    }
    else{
        settext("Wrong username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
            <div className="error-message">
                {text}
            </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
