import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './components/Home';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
