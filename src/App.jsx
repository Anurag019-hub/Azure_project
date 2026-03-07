import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import PdfInput from './pages/PdfInput';
import PdfResult from './pages/PdfResult';
import AudioInput from './pages/AudioInput';
import AudioResult from './pages/AudioResult';

/** Inner component so useLocation() works inside BrowserRouter */
function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/pdf" element={<PdfInput />} />
                <Route path="/pdf/result" element={<PdfResult />} />
                <Route path="/audio" element={<AudioInput />} />
                <Route path="/audio/result" element={<AudioResult />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AnimatedRoutes />
        </BrowserRouter>
    );
}

export default App;
