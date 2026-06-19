import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Day from './screens/Day';
import LogExercise from './screens/LogExercise';
import History from './screens/History';
import Data from './screens/Data';

export default function App() {
  return (
    <div className="mx-auto min-h-screen max-w-md px-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/day/:dayId" element={<Day />} />
        <Route path="/day/:dayId/log/:exerciseId" element={<LogExercise />} />
        <Route path="/history/:exerciseId" element={<History />} />
        <Route path="/data" element={<Data />} />
      </Routes>
    </div>
  );
}
