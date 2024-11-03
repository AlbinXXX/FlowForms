import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Pages/Home';
import NotFound from './Pages/NotFound';

const AllRoutes  = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
function App() {

  return (
    <div className="App">
      <AllRoutes />
    </div>
  )
}

export default App
