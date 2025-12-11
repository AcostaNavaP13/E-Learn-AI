import React, { useState } from 'react';
import { UserInput, DifficultyLevel, CourseFormat } from '../types';
import { Upload, Sparkles, BookOpen, Clock, Target, User, Loader2, FileText } from 'lucide-react';

interface CourseFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<DifficultyLevel>('Principiante');
  const [profile, setProfile] = useState('');
  const [goal, setGoal] = useState('');
  const [timeAvailable, setTimeAvailable] = useState('');
  const [format, setFormat] = useState<CourseFormat>('Mixto');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ topic, level, profile, goal, timeAvailable, format, files });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight dark:text-white">
          Diseña tu <span className="text-brand-400 relative inline-block">
            Aula Virtual
            <svg className="absolute -bottom-2 left-0 w-full h-2 text-brand-400/30" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Sube tus documentos o elige un tema. Nuestra IA construirá un plan de estudio interactivo, con lecciones, tests y seguimiento.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-none border border-slate-100 dark:border-dark-border overflow-hidden transition-all duration-300">
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          
          {/* File Upload Area */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-brand-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative bg-slate-50 dark:bg-gray-800/50 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <input
                type="file"
                id="file-upload"
                multiple
                accept="*"
                onChange={handleFileChange}
                className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8" />
                </div>
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">Arrastra archivos o haz clic para subir</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    Aceptamos PDF, Excel, Word, PowerPoint e imágenes. Usaremos esto como base para el contenido.
                </span>
                {files.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3 justify-center w-full">
                    {files.map((f, i) => (
                        <div key={i} className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <FileText className="w-4 h-4 text-brand-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{f.name}</span>
                        </div>
                    ))}
                    </div>
                )}
                </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Topic */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Tema del curso
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Introducción a la Astrofísica, Liderazgo Empresarial..."
                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition text-lg placeholder:text-slate-400"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Profile */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Tu perfil
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Estudiante, Profesional..."
                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
              />
            </div>

             {/* Goal */}
             <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4" /> Objetivo
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Aprobar examen, Mejorar..."
                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            {/* Level */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nivel</label>
              <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition appearance-none"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
              </div>
            </div>

             {/* Time */}
             <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Tiempo disponible
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 4 semanas, 30 min/día"
                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition"
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(e.target.value)}
              />
            </div>

            {/* Format */}
            <div className="md:col-span-2 space-y-3">
               <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Formato preferido</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {['Lecturas breves', 'Lecturas + ejercicios', 'Esquemas + problemas', 'Mixto'].map((f) => (
                   <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f as CourseFormat)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                      format === f 
                      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-400 text-brand-700 dark:text-brand-300 shadow-md' 
                      : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-brand-200 dark:hover:border-gray-500'
                    }`}
                   >
                     {f}
                   </button>
                 ))}
               </div>
            </div>

          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-400'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="animate-pulse">Analizando documentos y diseñando curso...</span>
                </>
              ) : (
                <>
                  Generar Curso Completo <Sparkles className="w-5 h-5 fill-white/20" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      
      <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-8">
        Impulsado por Gemini AI · Generación de contenido educativa segura y adaptada.
      </p>
    </div>
  );
};

export default CourseForm;