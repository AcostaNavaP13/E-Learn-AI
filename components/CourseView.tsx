import React, { useState, useEffect } from 'react';
import { CourseStructure, Lesson, LessonBlock } from '../types';
import { 
    Book, CheckCircle, Circle, Menu, X, ChevronRight, ChevronLeft, 
    Lightbulb, Activity, CheckSquare, Layers, GraduationCap, 
    FileText, ExternalLink, PlayCircle, Trophy, BarChart3, 
    Clock, Award, Download, Moon, Sun, MonitorPlay, ArrowLeft
} from 'lucide-react';

interface CourseViewProps {
  course: CourseStructure;
  onBack: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Utility to generate and download HTML file
const downloadCourseAsHTML = (course: CourseStructure) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title} - Exportado</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        h1, h2, h3 { color: #111; }
        .header { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px; border-bottom: 4px solid #a2c037; }
        .unit { margin-bottom: 40px; }
        .lesson { background: #fff; padding: 30px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
        .block { margin-bottom: 25px; padding: 20px; border-radius: 8px; background: #f8fafc; border-left: 4px solid #a2c037; }
        .block-title { font-weight: bold; text-transform: uppercase; font-size: 0.8em; color: #666; margin-bottom: 10px; display: block; }
        .quiz { background: #f0fdf4; border-color: #22c55e; }
        .footer { text-align: center; margin-top: 50px; color: #888; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${course.title}</h1>
        <p>${course.subtitle}</p>
        <div><strong>Nivel:</strong> ${course.level} | <strong>Duración:</strong> ${course.duration}</div>
    </div>
    ${course.units.map(unit => `
        <div class="unit">
            <h2>${unit.title}</h2>
            <p><em>${unit.summary}</em></p>
            ${unit.lessons.map(lesson => `
                <div class="lesson">
                    <h3>${lesson.title}</h3>
                    ${lesson.blocks.map(block => `
                        <div class="block ${block.type === 'quiz' ? 'quiz' : ''}">
                            <span class="block-title">${block.type.toUpperCase()} - ${block.title}</span>
                            <div class="content">${block.content.replace(/\n/g, '<br>')}</div>
                            ${block.quizData ? `<p><strong>Pregunta:</strong> ${block.quizData.question}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `).join('')}
    <div class="footer">Generado con E-Learn AI</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const CourseView: React.FC<CourseViewProps> = ({ course, onBack, darkMode, toggleDarkMode }) => {
  const [currentUnitIdx, setCurrentUnitIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'lesson' | 'finalExam' | 'finalProject' | 'references'>('lesson');

  // Stats
  const totalUnits = course.units.length;
  const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const progressPercentage = Math.round((completedLessons.size / totalLessons) * 100);

  const currentUnit = course.units[currentUnitIdx];
  const currentLesson = currentUnit?.lessons[currentLessonIdx];

  const markCompleted = (unitIdx: number, lessonIdx: number) => {
    const lessonId = course.units[unitIdx].lessons[lessonIdx].id;
    setCompletedLessons(prev => new Set(prev).add(lessonId));
  };

  const navigateTo = (unitIdx: number, lessonIdx: number) => {
    setCurrentUnitIdx(unitIdx);
    setCurrentLessonIdx(lessonIdx);
    setViewMode('lesson');
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (viewMode === 'lesson') markCompleted(currentUnitIdx, currentLessonIdx);

    if (viewMode === 'lesson') {
      if (currentLessonIdx < currentUnit.lessons.length - 1) {
        navigateTo(currentUnitIdx, currentLessonIdx + 1);
      } else if (currentUnitIdx < course.units.length - 1) {
        navigateTo(currentUnitIdx + 1, 0);
      } else {
        setViewMode('finalExam');
      }
    } else if (viewMode === 'finalExam') {
        setViewMode('finalProject');
    } else if (viewMode === 'finalProject') {
        setViewMode('references');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    // Find first incomplete lesson
    for (let u = 0; u < course.units.length; u++) {
        for (let l = 0; l < course.units[u].lessons.length; l++) {
            const lessonId = course.units[u].lessons[l].id;
            if (!completedLessons.has(lessonId)) {
                navigateTo(u, l);
                return;
            }
        }
    }
    // If all done
    setViewMode('finalExam');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-dark-text overflow-hidden font-sans transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR (Plan de Estudios) --- */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 w-72 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                <span className="font-bold tracking-tight text-slate-800 dark:text-white">Aula<span className="text-brand-500">Virtual</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Course Progress Mini */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800/50">
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                <span>Tu Progreso</span>
                <span>{progressPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {course.units.map((unit, uIdx) => (
            <div key={unit.id} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${uIdx * 50}ms` }}>
              <div className="flex items-center gap-3 mb-3 px-2">
                 <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 dark:bg-gray-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-gray-700">
                    {uIdx + 1}
                 </span>
                 <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider line-clamp-1">
                   {unit.title}
                 </h3>
              </div>
              
              <div className="space-y-1">
                {unit.lessons.map((lesson, lIdx) => {
                  const isActive = viewMode === 'lesson' && currentUnitIdx === uIdx && currentLessonIdx === lIdx;
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateTo(uIdx, lIdx)}
                      className={`group w-full text-left py-2.5 px-3 rounded-lg text-sm transition-all flex items-start gap-3 relative ${
                        isActive 
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full" />}
                      <div className="mt-0.5 shrink-0">
                         {isCompleted ? (
                             <CheckCircle className="w-4 h-4 text-brand-500" />
                         ) : isActive ? (
                             <PlayCircle className="w-4 h-4 text-brand-500 fill-brand-100 dark:fill-brand-900" />
                         ) : (
                             <Circle className="w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-slate-400" />
                         )}
                      </div>
                      <span className="leading-tight">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Final Section Nav */}
          <div className="border-t border-slate-100 dark:border-gray-700 pt-4 mt-2 space-y-1">
             {['finalExam', 'finalProject', 'references'].map((mode) => {
                 const isActive = viewMode === mode;
                 let Icon = mode === 'finalExam' ? CheckSquare : mode === 'finalProject' ? Layers : Book;
                 let Label = mode === 'finalExam' ? 'Evaluación Final' : mode === 'finalProject' ? 'Proyecto Final' : 'Fuentes';
                 
                 return (
                    <button
                        key={mode}
                        onClick={() => { setViewMode(mode as any); setIsSidebarOpen(false); }}
                        className={`w-full text-left py-2.5 px-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                            isActive 
                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Icon className="w-4 h-4" /> {Label}
                    </button>
                 )
             })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-gray-800/30">
             <button 
                onClick={onBack} 
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
             >
                <ArrowLeft className="w-3 h-3" /> Salir del curso
             </button>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* 1. Header Superior */}
        <header className="h-auto min-h-[80px] bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-6 py-4 z-10 shrink-0 flex items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 overflow-hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500">
                    <Menu className="w-6 h-6" />
                </button>
                
                {/* Visual Cover/Icon */}
                <div className="hidden sm:flex h-12 w-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>

                <div className="flex flex-col overflow-hidden">
                   <h1 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white truncate">
                       {course.title}
                   </h1>
                   <div className="flex items-center gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                       <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {course.level}</span>
                       <span className="hidden md:flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                       <span className="hidden md:flex items-center gap-1"><Layers className="w-3 h-3" /> {totalUnits} Unidades</span>
                   </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                 {/* Theme Toggle */}
                 <button 
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                 >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>

                 {/* Export Button */}
                 <button 
                    onClick={() => downloadCourseAsHTML(course)}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                    title="Exportar curso a HTML"
                 >
                    <Download className="w-4 h-4" /> <span className="hidden lg:inline">Exportar</span>
                 </button>

                 {/* Continue CTA */}
                 <button 
                    onClick={handleContinue}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                 >
                    <span className="hidden sm:inline">Continuar</span> <ChevronRight className="w-4 h-4" />
                 </button>
            </div>
        </header>

        {/* 2. Content Zone */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-dark-bg p-4 md:p-8 custom-scrollbar">
           <div className="max-w-5xl mx-auto pb-20">
              
              {viewMode === 'lesson' && currentLesson && (
                  <LessonContent lesson={currentLesson} imageKeyword={course.coverImageKeyword} />
              )}

              {viewMode === 'finalExam' && (
                  <QuizView questions={course.finalEvaluation} title="Evaluación Final del Curso" />
              )}

              {viewMode === 'finalProject' && (
                  <ProjectView projects={course.finalProjects} />
              )}

               {viewMode === 'references' && (
                  <ReferencesView references={course.references} />
               )}

           </div>
        </div>

        {/* Navigation Footer */}
        <footer className="h-20 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
           <button 
             onClick={() => {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 if (!(currentLessonIdx === 0 && currentUnitIdx === 0)) {
                    onBack();
                 }
             }}
             className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium transition-colors opacity-0 pointer-events-none md:opacity-100"
           >
             {/* Hidden on mobile, aesthetic balance */}
           </button>

           <div className="flex gap-4 w-full md:w-auto justify-between md:justify-end">
                <button 
                    onClick={() => { // Logic for prev
                         if (viewMode === 'references') setViewMode('finalProject');
                         else if (viewMode === 'finalProject') setViewMode('finalExam');
                         else if (viewMode === 'finalExam') navigateTo(course.units.length - 1, course.units[course.units.length - 1].lessons.length - 1);
                         else if (currentLessonIdx > 0) navigateTo(currentUnitIdx, currentLessonIdx - 1);
                         else if (currentUnitIdx > 0) navigateTo(currentUnitIdx - 1, course.units[currentUnitIdx - 1].lessons.length - 1);
                    }}
                    disabled={currentUnitIdx === 0 && currentLessonIdx === 0 && viewMode === 'lesson'}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Anterior
                </button>

                <button 
                    onClick={handleNext}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                    {viewMode === 'references' ? 'Finalizar Curso' : 'Siguiente Lección'} <ChevronRight className="w-5 h-5" />
                </button>
           </div>
        </footer>

      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

const LessonContent: React.FC<{ lesson: Lesson, imageKeyword?: string }> = ({ lesson, imageKeyword }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Lesson Header */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[3/1] md:aspect-[4/1] flex items-end">
                 {/* Dynamically fetch an Unsplash image based on keyword */}
                 <img 
                    src={`https://source.unsplash.com/1600x900/?${imageKeyword || 'education,abstract'}`} 
                    alt="Lesson Header"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                 <div className="relative z-10 p-6 md:p-10 w-full">
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-500/90 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                        Lección Actual
                    </span>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight shadow-black drop-shadow-md">
                        {lesson.title}
                    </h2>
                 </div>
            </div>

            <div className="grid gap-6">
                {lesson.blocks.map((block, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-dark-border overflow-hidden hover:shadow-md transition-shadow group">
                        {/* Block Header */}
                        <div className={`px-6 py-4 border-b border-slate-50 dark:border-gray-800 flex items-center gap-3
                            ${block.type === 'concept' ? 'bg-blue-50/50 dark:bg-blue-900/10' : 
                              block.type === 'example' ? 'bg-amber-50/50 dark:bg-amber-900/10' : 
                              block.type === 'activity' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 
                              'bg-brand-50/50 dark:bg-brand-900/10'}
                        `}>
                            <div className={`p-2 rounded-lg ${
                                block.type === 'concept' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                                block.type === 'example' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' :
                                block.type === 'activity' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' :
                                'bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300'
                            }`}>
                                {block.type === 'concept' && <Lightbulb className="w-5 h-5" />}
                                {block.type === 'example' && <MonitorPlay className="w-5 h-5" />}
                                {block.type === 'activity' && <Activity className="w-5 h-5" />}
                                {block.type === 'quiz' && <Trophy className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    {block.type === 'concept' ? 'Fundamento Teórico' : 
                                     block.type === 'example' ? 'Caso Práctico' : 
                                     block.type === 'activity' ? 'Actividad' : 'Check de Conocimiento'}
                                </h3>
                                <p className={`font-semibold text-lg leading-none mt-0.5 ${
                                    block.type === 'concept' ? 'text-blue-900 dark:text-blue-100' :
                                    block.type === 'example' ? 'text-amber-900 dark:text-amber-100' :
                                    block.type === 'activity' ? 'text-emerald-900 dark:text-emerald-100' :
                                    'text-brand-900 dark:text-brand-100'
                                }`}>{block.title}</p>
                            </div>
                        </div>

                        {/* Block Content */}
                        <div className="p-6 md:p-8">
                            {block.type === 'quiz' && block.quizData ? (
                                <QuizBlock data={block.quizData} />
                            ) : (
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                    {block.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-4 last:mb-0">{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuizBlock: React.FC<{ data: any }> = ({ data }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    
    useEffect(() => { setSelected(null); setSubmitted(false); }, [data]);
    const isCorrect = selected === data.correctAnswerIndex;

    return (
        <div className="max-w-2xl">
            <h4 className="font-bold text-xl text-slate-800 dark:text-white mb-6">{data.question}</h4>
            <div className="space-y-3">
                {data.options.map((option: string, idx: number) => (
                    <button
                        key={idx}
                        disabled={submitted}
                        onClick={() => setSelected(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                            submitted
                                ? idx === data.correctAnswerIndex
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300'
                                    : idx === selected
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300'
                                        : 'bg-white dark:bg-dark-card border-slate-100 dark:border-dark-border text-slate-400 opacity-50'
                                : selected === idx
                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-800 dark:text-brand-300'
                                    : 'bg-white dark:bg-dark-card border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700'
                        }`}
                    >
                        <span className="font-medium">{option}</span>
                        {submitted && idx === data.correctAnswerIndex && <CheckCircle className="w-6 h-6 text-green-500" />}
                        {submitted && idx === selected && idx !== data.correctAnswerIndex && <X className="w-6 h-6 text-red-500" />}
                    </button>
                ))}
            </div>
            {!submitted && selected !== null && (
                <button 
                    onClick={() => setSubmitted(true)}
                    className="mt-6 bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
                >
                    Comprobar Respuesta
                </button>
            )}
            {submitted && isCorrect && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-800 dark:text-green-300 animate-in fade-in slide-in-from-top-2">
                    <Award className="w-6 h-6" />
                    <span className="font-bold">¡Correcto! Has dominado este concepto.</span>
                </div>
            )}
        </div>
    );
}

const QuizView: React.FC<{ questions: any[], title: string }> = ({ questions, title }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    const score = Object.keys(answers).reduce((acc, qIdx) => {
        const idx = parseInt(qIdx);
        return acc + (answers[idx] === questions[idx].correctAnswerIndex ? 1 : 0);
    }, 0);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-brand-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl shadow-brand-500/20">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-brand-100" />
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{title}</h2>
                <p className="text-brand-100 text-lg">Demuestra tu maestría completando el examen final.</p>
                
                {showResults && (
                    <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 inline-block min-w-[200px]">
                        <p className="uppercase tracking-widest text-xs font-bold text-brand-100 mb-1">Calificación Final</p>
                        <div className="text-5xl font-extrabold">{Math.round((score / questions.length) * 10)}<span className="text-2xl opacity-60">/10</span></div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-border">
                        <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm">{idx + 1}</span>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">{q.question}</h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <button
                                            key={optIdx}
                                            disabled={showResults}
                                            onClick={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                                            className={`p-4 rounded-xl border text-left text-sm transition-all font-medium ${
                                                showResults 
                                                  ? optIdx === q.correctAnswerIndex 
                                                      ? 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                                                      : answers[idx] === optIdx 
                                                          ? 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/30 dark:text-red-200'
                                                          : 'opacity-50 border-slate-100 dark:border-gray-700'
                                                  : answers[idx] === optIdx
                                                      ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                                                      : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-brand-400'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-8">
                {!showResults && (
                    <button 
                        onClick={() => setShowResults(true)}
                        disabled={Object.keys(answers).length < questions.length}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        Entregar Evaluación
                    </button>
                )}
            </div>
        </div>
    );
};

const ProjectView: React.FC<{ projects: any[] }> = ({ projects }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 mb-6 rotate-3 shadow-lg">
                <Layers className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Proyecto Final</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Consolida tu aprendizaje aplicando los conceptos en un escenario del mundo real.
            </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 font-bold text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        {idx + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{project.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{project.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const ReferencesView: React.FC<{ references: any[] }> = ({ references }) => (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Fuentes y Recursos</h2>
            <div className="h-1 w-20 bg-brand-500 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden">
            {references.map((ref, idx) => (
                <div key={idx} className="p-6 border-b border-slate-100 dark:border-dark-border last:border-0 flex items-start gap-5 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Book className="w-6 h-6 text-brand-400 mt-1 shrink-0" />
                    <div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{ref.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-2">{ref.author}</p>
                        {ref.url && (
                            <a href={ref.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-brand-100 hover:text-brand-700 transition-colors">
                                Ver Recurso <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default CourseView;