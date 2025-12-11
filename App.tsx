import React, { useState, useEffect } from 'react';
import { AppView, CourseStructure, UserInput } from './types';
import CourseForm from './components/CourseForm';
import CourseView from './components/CourseView';
import { generateCourse } from './services/geminiService';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('designer');
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState<CourseStructure | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCreateCourse = async (input: UserInput) => {
    setIsLoading(true);
    try {
      const data = await generateCourse(input);
      setCourseData(data);
      setView('classroom');
    } catch (error) {
      alert("Hubo un error generando el curso. Por favor intenta de nuevo.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (confirm("¿Estás seguro? Perderás el progreso actual de este curso.")) {
        setView('designer');
        setCourseData(null);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-dark-bg text-dark-text' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Global Header */}
      {view === 'designer' && (
         <header className={`py-4 px-6 flex justify-between items-center sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${darkMode ? 'bg-dark-card/80 border-dark-border' : 'bg-white/80 border-slate-200'}`}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-400/30">
                  E
                </div>
                <span className={`font-bold text-xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  E-Learn <span className="text-brand-400">AI</span>
                </span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-dark-border text-brand-300 hover:bg-gray-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </header>
      )}

      {view === 'designer' && (
        <main className="flex-1">
            <CourseForm onSubmit={handleCreateCourse} isLoading={isLoading} />
        </main>
      )}

      {view === 'classroom' && courseData && (
        <CourseView course={courseData} onBack={handleBack} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      )}
    </div>
  );
};

export default App;