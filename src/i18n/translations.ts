export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.planner'
  | 'nav.focus'
  | 'nav.timetable'
  | 'nav.analytics'
  | 'nav.settings'
  | 'nav.about'
  | 'header.search'
  | 'header.syllabusSynced'
  | 'header.startFocus'
  | 'header.voiceAssistant'
  | 'header.switchTheme'
  | 'header.profile'
  | 'dashboard.greetingMorning'
  | 'dashboard.greetingAfternoon'
  | 'dashboard.greetingEvening'
  | 'dashboard.greetingNight'
  | 'dashboard.todayProgress'
  | 'dashboard.completedSessions'
  | 'dashboard.remainingSessions'
  | 'dashboard.currentSubject'
  | 'dashboard.nextSession'
  | 'dashboard.examCountdown'
  | 'dashboard.startStudySession'
  | 'dashboard.todaySchedule'
  | 'dashboard.noSessions'
  | 'dashboard.markComplete'
  | 'dashboard.skip'
  | 'dashboard.reschedule'
  | 'dashboard.daysLeft'
  | 'dashboard.hoursToday'
  | 'dashboard.smartRecs'
  | 'focus.title'
  | 'focus.prepScreen'
  | 'focus.startFocusSession'
  | 'focus.pause'
  | 'focus.resume'
  | 'focus.reset'
  | 'focus.finishEarly'
  | 'focus.copyPrompt'
  | 'focus.promptCopied'
  | 'focus.examGoal'
  | 'focus.answerLength'
  | 'focus.fullscreen'
  | 'focus.exitFullscreen'
  | 'focus.shield'
  | 'focus.shieldActive'
  | 'focus.monitor'
  | 'focus.soundscape'
  | 'focus.soundNone'
  | 'focus.soundRain'
  | 'focus.soundWhiteNoise'
  | 'focus.soundBinaural'
  | 'focus.voiceAssistant'
  | 'focus.postSessionTitle'
  | 'focus.postSessionDesc'
  | 'focus.markCompleted'
  | 'focus.markNeedsRevision'
  | 'focus.markInProgress'
  | 'focus.saveProgress'
  | 'planner.title'
  | 'planner.importPdf'
  | 'planner.importPdfDesc'
  | 'planner.allSubjects'
  | 'planner.modules'
  | 'planner.topics'
  | 'planner.startTopicFocus'
  | 'planner.notStarted'
  | 'planner.inProgress'
  | 'planner.completed'
  | 'planner.needsRevision'
  | 'timetable.title'
  | 'timetable.examSchedule'
  | 'timetable.addExam'
  | 'timetable.studySlots'
  | 'timetable.session'
  | 'analytics.title'
  | 'analytics.weeklyHours'
  | 'analytics.subjectBreakdown'
  | 'analytics.completionRate'
  | 'analytics.streak'
  | 'settings.title'
  | 'settings.language'
  | 'settings.profiles'
  | 'settings.newProfile'
  | 'settings.switchProfile'
  | 'settings.presets'
  | 'settings.appearance'
  | 'settings.notifications'
  | 'settings.startup'
  | 'settings.exportImport'
  | 'settings.reset'
  | 'onboarding.welcome'
  | 'onboarding.welcomeDesc'
  | 'onboarding.stepProfile'
  | 'onboarding.stepPreset'
  | 'onboarding.stepTheme'
  | 'onboarding.getStarted'
  | 'onboarding.next'
  | 'onboarding.back'
  | 'onboarding.nameLabel'
  | 'onboarding.courseLabel'
  | 'onboarding.examDateLabel'
  | 'common.cancel'
  | 'common.save'
  | 'common.confirm'
  | 'common.delete'
  | 'common.edit'
  | 'common.close';

export type LanguageCode = 'en' | 'es' | 'ml' | 'hi';

export const TRANSLATIONS: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.planner': 'Study Planner',
    'nav.focus': 'Focus Mode',
    'nav.timetable': 'Timetable',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.about': 'About',
    'header.search': 'Search topics...',
    'header.syllabusSynced': 'SYLLABUS SYNCED',
    'header.startFocus': 'Start Focus',
    'header.voiceAssistant': 'Voice Assistant',
    'header.switchTheme': 'Switch Theme',
    'header.profile': 'Profile',
    'dashboard.greetingMorning': 'Good Morning',
    'dashboard.greetingAfternoon': 'Good Afternoon',
    'dashboard.greetingEvening': 'Good Evening',
    'dashboard.greetingNight': 'Good Night',
    'dashboard.todayProgress': "Today's Study Progress",
    'dashboard.completedSessions': 'Completed Sessions',
    'dashboard.remainingSessions': 'Remaining Sessions',
    'dashboard.currentSubject': 'Current Subject',
    'dashboard.nextSession': 'Next Scheduled Session',
    'dashboard.examCountdown': 'Next University Exam',
    'dashboard.startStudySession': 'START STUDY SESSION',
    'dashboard.todaySchedule': "Today's Study Timeline",
    'dashboard.noSessions': 'No more sessions scheduled for today',
    'dashboard.markComplete': 'Mark Complete',
    'dashboard.skip': 'Skip',
    'dashboard.reschedule': 'Reschedule',
    'dashboard.daysLeft': 'days left',
    'dashboard.hoursToday': 'hours logged today',
    'dashboard.smartRecs': 'Smart Syllabus Recommendations',
    'focus.title': 'Focus Mode',
    'focus.prepScreen': 'Topic Study Preparation',
    'focus.startFocusSession': 'START FOCUS SESSION',
    'focus.pause': 'Pause Timer',
    'focus.resume': 'Resume Timer',
    'focus.reset': 'Reset',
    'focus.finishEarly': 'Finish Early',
    'focus.copyPrompt': 'Copy Study Prompt',
    'focus.promptCopied': 'Prompt Copied!',
    'focus.examGoal': 'Exam Study Goal',
    'focus.answerLength': 'Answer Length',
    'focus.fullscreen': 'Full Screen',
    'focus.exitFullscreen': 'Exit Full Screen',
    'focus.shield': 'Focus Shield',
    'focus.shieldActive': 'Distraction Shield Active',
    'focus.monitor': 'Engagement Monitor (Beta)',
    'focus.soundscape': 'Ambient Audio',
    'focus.soundNone': 'Silent',
    'focus.soundRain': 'Rainfall',
    'focus.soundWhiteNoise': 'White Noise',
    'focus.soundBinaural': 'Binaural Focus 40Hz',
    'focus.voiceAssistant': 'AI Voice Assistant',
    'focus.postSessionTitle': 'Session Accountability Check',
    'focus.postSessionDesc': 'How is your mastery of this syllabus topic?',
    'focus.markCompleted': 'Topic Mastered (Completed)',
    'focus.markNeedsRevision': 'Needs Further Revision',
    'focus.markInProgress': 'Still In Progress',
    'focus.saveProgress': 'Save & Update Planner',
    'planner.title': 'University Syllabus & Study Planner',
    'planner.importPdf': 'Upload & Analyze PDF Syllabus',
    'planner.importPdfDesc': 'Extract subjects, modules, topics, and exam dates automatically',
    'planner.allSubjects': 'All Subjects',
    'planner.modules': 'Modules',
    'planner.topics': 'Topics',
    'planner.startTopicFocus': 'Study Topic',
    'planner.notStarted': 'Not Started',
    'planner.inProgress': 'In Progress',
    'planner.completed': 'Completed',
    'planner.needsRevision': 'Needs Revision',
    'timetable.title': 'Routine & Exam Timetable',
    'timetable.examSchedule': 'Upcoming Exams',
    'timetable.addExam': 'Add Exam',
    'timetable.studySlots': 'Daily Routine Slots',
    'timetable.session': 'Session',
    'analytics.title': 'Study Performance & Analytics',
    'analytics.weeklyHours': 'Weekly Focus Hours',
    'analytics.subjectBreakdown': 'Subject Distribution',
    'analytics.completionRate': 'Syllabus Completion',
    'analytics.streak': 'Daily Consistency Streak',
    'settings.title': 'Command Center Settings',
    'settings.language': 'Application Language (i18n)',
    'settings.profiles': 'User Profiles & Personalization',
    'settings.newProfile': 'Create New Profile',
    'settings.switchProfile': 'Active Profile',
    'settings.presets': 'Study & Break Session Presets',
    'settings.appearance': 'Appearance & Theme Customization',
    'settings.notifications': 'Windows Desktop Notifications',
    'settings.startup': 'Windows Startup & System Tray',
    'settings.exportImport': 'Data Backup & Restore',
    'settings.reset': 'Factory Reset Data',
    'onboarding.welcome': 'Welcome to STUDY COMMAND V3',
    'onboarding.welcomeDesc': 'Your intelligent, offline-capable exam preparation command center.',
    'onboarding.stepProfile': 'Personalize Your Profile',
    'onboarding.stepPreset': 'Choose Your Study Rhythm',
    'onboarding.stepTheme': 'Choose Theme & Mode',
    'onboarding.getStarted': 'Launch Command Center',
    'onboarding.next': 'Next',
    'onboarding.back': 'Back',
    'onboarding.nameLabel': 'Your Name / Call Sign',
    'onboarding.courseLabel': 'Degree / Course / Major',
    'onboarding.examDateLabel': 'Next Target Exam Date',
    'common.cancel': 'Cancel',
    'common.save': 'Save Changes',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
  },
  es: {
    'nav.dashboard': 'Panel Principal',
    'nav.planner': 'Planificador',
    'nav.focus': 'Modo Enfoque',
    'nav.timetable': 'Horario',
    'nav.analytics': 'Estadísticas',
    'nav.settings': 'Ajustes',
    'nav.about': 'Acerca de',
    'header.search': 'Buscar temas...',
    'header.syllabusSynced': 'PLAN SINCRONIZADO',
    'header.startFocus': 'Iniciar Enfoque',
    'header.voiceAssistant': 'Asistente de Voz',
    'header.switchTheme': 'Cambiar Tema',
    'header.profile': 'Perfil',
    'dashboard.greetingMorning': 'Buenos Días',
    'dashboard.greetingAfternoon': 'Buenas Tardes',
    'dashboard.greetingEvening': 'Buenas Noches',
    'dashboard.greetingNight': 'Buenas Noches',
    'dashboard.todayProgress': 'Progreso de Estudio Hoy',
    'dashboard.completedSessions': 'Sesiones Completadas',
    'dashboard.remainingSessions': 'Sesiones Restantes',
    'dashboard.currentSubject': 'Materia Actual',
    'dashboard.nextSession': 'Próxima Sesión Programada',
    'dashboard.examCountdown': 'Próximo Examen Universitario',
    'dashboard.startStudySession': 'INICIAR SESIÓN DE ESTUDIO',
    'dashboard.todaySchedule': 'Cronograma de Estudio de Hoy',
    'dashboard.noSessions': 'No hay más sesiones para hoy',
    'dashboard.markComplete': 'Marcar Completa',
    'dashboard.skip': 'Omitir',
    'dashboard.reschedule': 'Reprogramar',
    'dashboard.daysLeft': 'días restantes',
    'dashboard.hoursToday': 'horas registradas hoy',
    'dashboard.smartRecs': 'Recomendaciones Inteligentes de Estudio',
    'focus.title': 'Modo de Enfoque',
    'focus.prepScreen': 'Preparación del Tema de Estudio',
    'focus.startFocusSession': 'COMENZAR SESIÓN DE ENFOQUE',
    'focus.pause': 'Pausar',
    'focus.resume': 'Reanudar',
    'focus.reset': 'Reiniciar',
    'focus.finishEarly': 'Terminar Antes',
    'focus.copyPrompt': 'Copiar Prompt de Estudio',
    'focus.promptCopied': '¡Prompt Copiado!',
    'focus.examGoal': 'Objetivo del Examen',
    'focus.answerLength': 'Longitud de Respuesta',
    'focus.fullscreen': 'Pantalla Completa',
    'focus.exitFullscreen': 'Salir de Pantalla Completa',
    'focus.shield': 'Escudo Antidistracciones',
    'focus.shieldActive': 'Escudo de Enfoque Activo',
    'focus.monitor': 'Monitor de Atención (Beta)',
    'focus.soundscape': 'Sonido Ambiental',
    'focus.soundNone': 'Silencio',
    'focus.soundRain': 'Lluvia',
    'focus.soundWhiteNoise': 'Ruido Blanco',
    'focus.soundBinaural': 'Binaural 40Hz',
    'focus.voiceAssistant': 'Asistente de Voz IA',
    'focus.postSessionTitle': 'Verificación de Dominio del Tema',
    'focus.postSessionDesc': '¿Cómo evalúas tu dominio de este tema?',
    'focus.markCompleted': 'Tema Dominado (Completado)',
    'focus.markNeedsRevision': 'Necesita Revisión',
    'focus.markInProgress': 'En Progreso',
    'focus.saveProgress': 'Guardar y Actualizar Plan',
    'planner.title': 'Plan de Estudios Universitario',
    'planner.importPdf': 'Subir y Analizar PDF',
    'planner.importPdfDesc': 'Extrae materias, módulos, temas y fechas automáticamente',
    'planner.allSubjects': 'Todas las Materias',
    'planner.modules': 'Módulos',
    'planner.topics': 'Temas',
    'planner.startTopicFocus': 'Estudiar Tema',
    'planner.notStarted': 'No Iniciado',
    'planner.inProgress': 'En Progreso',
    'planner.completed': 'Completado',
    'planner.needsRevision': 'Revisión Necesaria',
    'timetable.title': 'Rutina y Horario de Exámenes',
    'timetable.examSchedule': 'Próximos Exámenes',
    'timetable.addExam': 'Añadir Examen',
    'timetable.studySlots': 'Franjas Diarias de Rutina',
    'timetable.session': 'Sesión',
    'analytics.title': 'Rendimiento y Métricas',
    'analytics.weeklyHours': 'Horas Semanales de Enfoque',
    'analytics.subjectBreakdown': 'Distribución por Materia',
    'analytics.completionRate': 'Completitud del Plan',
    'analytics.streak': 'Racha de Días Consecutivos',
    'settings.title': 'Ajustes del Centro de Mando',
    'settings.language': 'Idioma de la Aplicación',
    'settings.profiles': 'Perfiles de Usuario',
    'settings.newProfile': 'Crear Perfil',
    'settings.switchProfile': 'Perfil Activo',
    'settings.presets': 'Preajustes de Estudio y Pausas',
    'settings.appearance': 'Apariencia y Colores',
    'settings.notifications': 'Notificaciones de Windows',
    'settings.startup': 'Inicio Automático y Bandeja',
    'settings.exportImport': 'Copia de Seguridad y Restauración',
    'settings.reset': 'Restablecer Datos',
    'onboarding.welcome': 'Bienvenido a STUDY COMMAND V3',
    'onboarding.welcomeDesc': 'Tu centro inteligente y local de preparación para exámenes.',
    'onboarding.stepProfile': 'Personaliza tu Perfil',
    'onboarding.stepPreset': 'Elige tu Ritmo de Estudio',
    'onboarding.stepTheme': 'Elige Tema y Modo',
    'onboarding.getStarted': 'Iniciar Aplicación',
    'onboarding.next': 'Siguiente',
    'onboarding.back': 'Atrás',
    'onboarding.nameLabel': 'Tu Nombre',
    'onboarding.courseLabel': 'Carrera / Grado',
    'onboarding.examDateLabel': 'Fecha del Próximo Examen',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.confirm': 'Confirmar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
  },
  ml: {
    'nav.dashboard': 'ഡാഷ്‌ബോർഡ്',
    'nav.planner': 'സിലബസ് പ്ലാനർ',
    'nav.focus': 'ഫോക്കസ് മോഡ്',
    'nav.timetable': 'ടൈംടേബിൾ',
    'nav.analytics': 'വിശകലനം',
    'nav.settings': 'ക്രമീകരണങ്ങൾ',
    'nav.about': 'വിവരങ്ങൾ',
    'header.search': 'വിഷയങ്ങൾ തിരയുക...',
    'header.syllabusSynced': 'സിലബസ് സിങ്ക് ചെയ്തു',
    'header.startFocus': 'പഠനം തുടങ്ങുക',
    'header.voiceAssistant': 'വോയ്സ് അസിസ്റ്റന്റ്',
    'header.switchTheme': 'തീം മാറ്റുക',
    'header.profile': 'പ്രൊഫൈൽ',
    'dashboard.greetingMorning': 'സുപ്രഭാതം',
    'dashboard.greetingAfternoon': 'ശുഭ ഉച്ചതിരിഞ്ഞ്',
    'dashboard.greetingEvening': 'ശുഭ സായാഹ്നം',
    'dashboard.greetingNight': 'ശുഭ രാത്രി',
    'dashboard.todayProgress': 'ഇന്നത്തെ പഠന പുരോഗതി',
    'dashboard.completedSessions': 'പൂർത്തിയായ സെഷനുകൾ',
    'dashboard.remainingSessions': 'ബാക്കിയുള്ള സെഷനുകൾ',
    'dashboard.currentSubject': 'ഇപ്പോഴത്തെ വിഷയം',
    'dashboard.nextSession': 'അടുത്ത സെഷൻ',
    'dashboard.examCountdown': 'അടുത്ത പരീക്ഷ',
    'dashboard.startStudySession': 'പഠന സെഷൻ ആരംഭിക്കുക',
    'dashboard.todaySchedule': 'ഇന്നത്തെ പഠന സമയക്രമം',
    'dashboard.noSessions': 'ഇന്ന് ഇനി സെഷനുകൾ ഒന്നും ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല',
    'dashboard.markComplete': 'പൂർത്തിയായി',
    'dashboard.skip': 'ഒഴിവാക്കുക',
    'dashboard.reschedule': 'സമയം മാറ്റുക',
    'dashboard.daysLeft': 'ദിവസങ്ങൾ ബാക്കി',
    'dashboard.hoursToday': 'മണിക്കൂറുകൾ പഠിച്ചു',
    'dashboard.smartRecs': 'സ്മാർട്ട് സിലബസ് ശുപാർശകൾ',
    'focus.title': 'ഫോക്കസ് മോഡ്',
    'focus.prepScreen': 'പഠന തയ്യാറെടുപ്പ്',
    'focus.startFocusSession': 'ഫോക്കസ് ടൈമർ തുടങ്ങുക',
    'focus.pause': 'താൽക്കാലികമായി നിർത്തുക',
    'focus.resume': 'തുടരുക',
    'focus.reset': 'റീസെറ്റ്',
    'focus.finishEarly': 'നേരത്തെ പൂർത്തിയാക്കുക',
    'focus.copyPrompt': 'പഠന പ്രോംപ്റ്റ് കോപ്പി ചെയ്യുക',
    'focus.promptCopied': 'കോപ്പി ചെയ്തു!',
    'focus.examGoal': 'പഠന ലക്ഷ്യം',
    'focus.answerLength': 'ഉത്തരത്തിന്റെ ദൈർഘ്യം',
    'focus.fullscreen': 'ഫുൾ സ്ക്രീൻ',
    'focus.exitFullscreen': 'ഫുൾ സ്ക്രീൻ നിർത്തുക',
    'focus.shield': 'ഡിസ്ട്രാക്ഷൻ ഷീൽഡ്',
    'focus.shieldActive': 'ഫോക്കസ് ഷീൽഡ് പ്രവർത്തിക്കുന്നു',
    'focus.monitor': 'ശ്രദ്ധാ മോണിറ്റർ',
    'focus.soundscape': 'ശബ്ദ പശ്ചാത്തലം',
    'focus.soundNone': 'നിശബ്ദം',
    'focus.soundRain': 'മഴ',
    'focus.soundWhiteNoise': 'വൈറ്റ് നോയ്‌സ്',
    'focus.soundBinaural': 'ബൈനറൽ 40Hz',
    'focus.voiceAssistant': 'വോയ്സ് അസിസ്റ്റന്റ്',
    'focus.postSessionTitle': 'സെഷൻ പരിശോധന',
    'focus.postSessionDesc': 'ഈ വിഷയത്തിൽ എത്രത്തോളം പഠനം പൂർത്തിയായി?',
    'focus.markCompleted': 'പൂർണ്ണമായി പഠിച്ചു',
    'focus.markNeedsRevision': 'വീണ്ടും റിവിഷൻ വേണം',
    'focus.markInProgress': 'പഠിച്ചുകൊണ്ടിരിക്കുന്നു',
    'focus.saveProgress': 'സേവ് ചെയ്യുക',
    'planner.title': 'യൂണിവേഴ്സിറ്റി സിലബസും പ്ലാനറും',
    'planner.importPdf': 'സിലബസ് PDF അപ്‌ലോഡ് ചെയ്യുക',
    'planner.importPdfDesc': 'വിഷയങ്ങളും പരീക്ഷാ തീയതികളും ഓട്ടോമാറ്റിക്കായി ചേർക്കുക',
    'planner.allSubjects': 'എല്ലാ വിഷയങ്ങളും',
    'planner.modules': 'മൊഡ്യൂളുകൾ',
    'planner.topics': 'ടോപ്പിക്കുകൾ',
    'planner.startTopicFocus': 'പഠനം തുടങ്ങുക',
    'planner.notStarted': 'തുടങ്ങിയിട്ടില്ല',
    'planner.inProgress': 'പഠനത്തിൽ',
    'planner.completed': 'പൂർത്തിയായി',
    'planner.needsRevision': 'റിവിഷൻ വേണം',
    'timetable.title': 'പഠന ദിനചര്യയും പരീക്ഷാ ടൈംടേബിളും',
    'timetable.examSchedule': 'വരാനിരിക്കുന്ന പരീക്ഷകൾ',
    'timetable.addExam': 'പരീക്ഷ ചേർക്കുക',
    'timetable.studySlots': 'പ്രതിദിന പഠന സ്ലോട്ടുകൾ',
    'timetable.session': 'സെഷൻ',
    'analytics.title': 'പഠന പുരോഗതിയും വിശകലനവും',
    'analytics.weeklyHours': 'ആഴ്ചയിലെ ഫോക്കസ് സമയം',
    'analytics.subjectBreakdown': 'വിഷയ വിതരണം',
    'analytics.completionRate': 'സിലബസ് പൂർത്തീകരണ നിരക്ക്',
    'analytics.streak': 'സ്ഥിരത സ്ട്രീക്ക്',
    'settings.title': 'ആപ്പ് ക്രമീകരണങ്ങൾ',
    'settings.language': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'settings.profiles': 'ഉപയോക്തൃ പ്രൊഫൈലുകൾ',
    'settings.newProfile': 'പുതിയ പ്രൊഫൈൽ',
    'settings.switchProfile': 'പ്രൊഫൈൽ മാറ്റുക',
    'settings.presets': 'പഠന ഇടവേള പ്രീസെറ്റുകൾ',
    'settings.appearance': 'തീമും നിറങ്ങളും',
    'settings.notifications': 'ഡെസ്ക്ടോപ്പ് അറിയിപ്പുകൾ',
    'settings.startup': 'വിൻഡോസ് സ്റ്റാർട്ടപ്പ്',
    'settings.exportImport': 'ബാക്കപ്പും ഡാറ്റയും',
    'settings.reset': 'റീസെറ്റ് ചെയ്യുക',
    'onboarding.welcome': 'STUDY COMMAND V3-ലേക്ക് സ്വാഗതം',
    'onboarding.welcomeDesc': 'നിങ്ങളുടെ സ്വന്തം പരീക്ഷാ തയ്യാറെടുപ്പ് കമാൻഡ് സെന്റർ.',
    'onboarding.stepProfile': 'നിങ്ങളുടെ പ്രൊഫൈൽ തയ്യാറാക്കുക',
    'onboarding.stepPreset': 'പഠന താളം തിരഞ്ഞെടുക്കുക',
    'onboarding.stepTheme': 'തീമും മോഡും തിരഞ്ഞെടുക്കുക',
    'onboarding.getStarted': 'ആരംഭിക്കുക',
    'onboarding.next': 'അടുത്തത്',
    'onboarding.back': 'പുറകോട്ട്',
    'onboarding.nameLabel': 'പേര്',
    'onboarding.courseLabel': 'കോഴ്സ് / ബ്രാഞ്ച്',
    'onboarding.examDateLabel': 'അടുത്ത പരീക്ഷാ തീയതി',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.save': 'സേവ് ചെയ്യുക',
    'common.confirm': 'ഉറപ്പാക്കുക',
    'common.delete': 'ഡിലീറ്റ്',
    'common.edit': 'എഡിറ്റ്',
    'common.close': 'അടയ്ക്കുക',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.planner': 'स्टडी प्लानर',
    'nav.focus': 'फोकस मोड',
    'nav.timetable': 'समय सारणी',
    'nav.analytics': 'एनालिटिक्स',
    'nav.settings': 'सेटिंग्स',
    'nav.about': 'के बारे में',
    'header.search': 'विषय खोजें...',
    'header.syllabusSynced': 'सिलेबस सिंक हुआ',
    'header.startFocus': 'फोकस शुरू करें',
    'header.voiceAssistant': 'वॉयस असिस्टेंट',
    'header.switchTheme': 'थीम बदलें',
    'header.profile': 'प्रोफ़ाइल',
    'dashboard.greetingMorning': 'शुभ प्रभात',
    'dashboard.greetingAfternoon': 'शुभ दोपहर',
    'dashboard.greetingEvening': 'शुभ संध्या',
    'dashboard.greetingNight': 'शुभ रात्रि',
    'dashboard.todayProgress': 'आज की अध्ययन प्रगति',
    'dashboard.completedSessions': 'पूर्ण सत्र',
    'dashboard.remainingSessions': 'शेष सत्र',
    'dashboard.currentSubject': 'वर्तमान विषय',
    'dashboard.nextSession': 'अगला सत्र',
    'dashboard.examCountdown': 'अगली विश्वविद्यालय परीक्षा',
    'dashboard.startStudySession': 'अध्ययन सत्र शुरू करें',
    'dashboard.todaySchedule': 'आज की अध्ययन समय सारणी',
    'dashboard.noSessions': 'आज के लिए कोई सत्र शेष नहीं है',
    'dashboard.markComplete': 'पूर्ण करें',
    'dashboard.skip': 'छोड़ें',
    'dashboard.reschedule': 'समय बदलें',
    'dashboard.daysLeft': 'दिन शेष',
    'dashboard.hoursToday': 'घंटे पढ़े गए',
    'dashboard.smartRecs': 'स्मार्ट सिलेबस सुझाव',
    'focus.title': 'फोकस मोड',
    'focus.prepScreen': 'विषय अध्ययन तैयारी',
    'focus.startFocusSession': 'फोकस सत्र शुरू करें',
    'focus.pause': 'विराम',
    'focus.resume': 'जारी रखें',
    'focus.reset': 'रीसेट',
    'focus.finishEarly': 'जल्दी समाप्त करें',
    'focus.copyPrompt': 'स्टडी प्रॉम्प्ट कॉपी करें',
    'focus.promptCopied': 'प्रॉम्प्ट कॉपी हो गया!',
    'focus.examGoal': 'परीक्षा अध्ययन लक्ष्य',
    'focus.answerLength': 'उत्तर की लंबाई',
    'focus.fullscreen': 'पूर्ण स्क्रीन',
    'focus.exitFullscreen': 'पूर्ण स्क्रीन से बाहर निकलें',
    'focus.shield': 'ध्यान भटकाव ढाल',
    'focus.shieldActive': 'फोकस शील्ड सक्रिय',
    'focus.monitor': 'अटेंशन मॉनिटर',
    'focus.soundscape': 'परिवेश ध्वनि',
    'focus.soundNone': 'शांत',
    'focus.soundRain': 'बारिश',
    'focus.soundWhiteNoise': 'व्हाइट नॉइज़',
    'focus.soundBinaural': 'बाइनॉरल 40Hz',
    'focus.voiceAssistant': 'एआई वॉयस असिस्टेंट',
    'focus.postSessionTitle': 'सत्र समीक्षा',
    'focus.postSessionDesc': 'इस विषय में आपकी तैयारी कैसी है?',
    'focus.markCompleted': 'विषय पूर्ण (महारत हासिल)',
    'focus.markNeedsRevision': 'रिवीजन की आवश्यकता है',
    'focus.markInProgress': 'प्रगति पर है',
    'focus.saveProgress': 'सहेजें और अपडेट करें',
    'planner.title': 'विश्वविद्यालय सिलेबस और प्लानर',
    'planner.importPdf': 'सिलेबस PDF अपलोड करें',
    'planner.importPdfDesc': 'विषय, मॉड्यूल और परीक्षा तिथियां स्वतः निकालें',
    'planner.allSubjects': 'सभी विषय',
    'planner.modules': 'मॉड्यूल',
    'planner.topics': 'विषय',
    'planner.startTopicFocus': 'विषय का अध्ययन करें',
    'planner.notStarted': 'शुरू नहीं हुआ',
    'planner.inProgress': 'प्रगति में',
    'planner.completed': 'पूर्ण',
    'planner.needsRevision': 'रिवीजन चाहिए',
    'timetable.title': 'दिनचर्या और परीक्षा समय सारणी',
    'timetable.examSchedule': 'आगामी परीक्षाएं',
    'timetable.addExam': 'परीक्षा जोड़ें',
    'timetable.studySlots': 'दैनिक अध्ययन स्लॉट',
    'timetable.session': 'सत्र',
    'analytics.title': 'अध्ययन प्रदर्शन और विश्लेषण',
    'analytics.weeklyHours': 'साप्ताहिक फोकस घंटे',
    'analytics.subjectBreakdown': 'विषय वितरण',
    'analytics.completionRate': 'सिलेबस पूर्णता दर',
    'analytics.streak': 'दैनिक निरंतरता स्ट्रीक',
    'settings.title': 'कमांड सेंटर सेटिंग्स',
    'settings.language': 'एप्लिकेशन भाषा',
    'settings.profiles': 'उपयोगकर्ता प्रोफ़ाइल',
    'settings.newProfile': 'नई प्रोफ़ाइल बनाएं',
    'settings.switchProfile': 'सक्रिय प्रोफ़ाइल',
    'settings.presets': 'अध्ययन और ब्रेक प्रीसेट',
    'settings.appearance': 'थीम और रंग',
    'settings.notifications': 'डेस्कटॉप सूचनाएं',
    'settings.startup': 'विंडोज़ स्टार्टअप',
    'settings.exportImport': 'बैकअप और पुनर्स्थापना',
    'settings.reset': 'फ़ैक्टरी रीसेट',
    'onboarding.welcome': 'STUDY COMMAND V3 में आपका स्वागत है',
    'onboarding.welcomeDesc': 'आपका बुद्धिमान और स्थानीय परीक्षा तैयारी कमांड सेंटर।',
    'onboarding.stepProfile': 'अपनी प्रोफ़ाइल अनुकूलित करें',
    'onboarding.stepPreset': 'अपनी अध्ययन गति चुनें',
    'onboarding.stepTheme': 'थीम और मोड चुनें',
    'onboarding.getStarted': 'आरंभ करें',
    'onboarding.next': 'आगे बढ़ें',
    'onboarding.back': 'पीछे',
    'onboarding.nameLabel': 'आपका नाम',
    'onboarding.courseLabel': 'डिग्री / कोर्स',
    'onboarding.examDateLabel': 'अगली परीक्षा तिथि',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.confirm': 'पुष्टि करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.close': 'बंद करें',
  },
};
