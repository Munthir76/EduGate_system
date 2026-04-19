import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // Auth
      "login": "تسجيل الدخول",
      "logout": "تسجيل الخروج",
      "username": "اسم المستخدم",
      "password": "كلمة المرور",
      "select_role": "اختر الدور",
      "remember_me": "تذكرني",
      "forgot_password": "نسيت كلمة المرور؟",
      "welcome_back": "أهلاً بعودتك",
      "login_subtitle": "نظام إدارة المدارس الذكي",
      
      // Roles
      "super_admin": "المدير العام",
      "school_admin": "مدير المدرسة",
      "teacher": "معلم",
      "student": "طالب",
      "parent": "ولي الأمر",
      
      // Navigation
      "dashboard": "لوحة التحكم",
      "schools": "المدارس",
      "students": "الطلاب",
      "teachers": "المعلمين",
      "parents": "أولياء الأمور",
      "attendance": "الحضور والغياب",
      "grades": "الدرجات",
      "assignments": "الواجبات",
      "fees": "الرسوم",
      "payments": "المدفوعات",
      "settings": "الإعدادات",
      
      // Actions
      "add": "إضافة",
      "edit": "تعديل",
      "delete": "حذف",
      "save": "حفظ",
      "cancel": "إلغاء",
      "search": "بحث",
      "filter": "تصفية",
      "export": "تصدير",
      "view": "عرض",
      "submit": "إرسال",
      
      // Dashboard
      "total_schools": "إجمالي المدارس",
      "total_students": "إجمالي الطلاب",
      "total_teachers": "إجمالي المعلمين",
      "total_parents": "إجمالي أولياء الأمور",
      "present_today": "حاضر اليوم",
      "absent_today": "غائب اليوم",
      "total_fees": "إجمالي الرسوم",
      "total_paid": "المدفوع",
      "total_pending": "المتبقي",
      
      // School Management
      "add_school": "إضافة مدرسة",
      "school_name": "اسم المدرسة",
      "school_name_ar": "الاسم بالعربية",
      "school_name_fr": "الاسم بالفرنسية",
      "address": "العنوان",
      "phone": "الهاتف",
      "email": "البريد الإلكتروني",
      "admin_info": "معلومات المدير",
      "admin_username": "اسم مستخدم المدير",
      "admin_password": "كلمة مرور المدير",
      "admin_full_name": "الاسم الكامل للمدير",
      
      // Student Management
      "add_student": "إضافة طالب",
      "student_info": "معلومات الطالب",
      "full_name": "الاسم الكامل",
      "class": "الصف",
      "grade": "المرحلة",
      "date_of_birth": "تاريخ الميلاد",
      "parent": "ولي الأمر",
      "medical_info": "المعلومات الطبية",
      
      // Teacher Management
      "add_teacher": "إضافة معلم",
      "teacher_info": "معلومات المعلم",
      "subjects": "المواد",
      "classes": "الصفوف",
      "specialization": "التخصص",
      
      // Attendance
      "mark_attendance": "تسجيل الحضور",
      "date": "التاريخ",
      "status": "الحالة",
      "present": "حاضر",
      "absent": "غائب",
      "late": "متأخر",
      "excused": "غياب بعذر",
      "notes": "ملاحظات",
      
      // Grades
      "add_grade": "إضافة درجة",
      "subject": "المادة",
      "assessment_type": "نوع التقييم",
      "assessment_name": "اسم التقييم",
      "score": "الدرجة",
      "max_score": "الدرجة القصوى",
      "percentage": "النسبة المئوية",
      "exam": "امتحان",
      "quiz": "اختبار قصير",
      "homework": "واجب منزلي",
      "project": "مشروع",
      
      // Assignments
      "add_assignment": "إضافة واجب",
      "title": "العنوان",
      "description": "الوصف",
      "due_date": "تاريخ التسليم",
      "attachment": "المرفقات",
      
      // Fees
      "add_fee": "إضافة رسوم",
      "amount": "المبلغ",
      "fee_type": "نوع الرسوم",
      "academic_year": "السنة الدراسية",
      "semester": "الفصل الدراسي",
      "paid": "مدفوع",
      "pending": "معلق",
      "partial": "مدفوع جزئياً",
      "overdue": "متأخر",
      "tuition": "رسوم دراسية",
      "transport": "نقل",
      "books": "كتب",
      
      // Payments
      "add_payment": "إضافة دفعة",
      "payment_method": "طريقة الدفع",
      "reference_number": "رقم المرجع",
      "payment_date": "تاريخ الدفع",
      "cash": "نقد",
      "bank_transfer": "تحويل بنكي",
      "online": "إلكتروني",
      
      // Messages
      "loading": "جاري التحميل...",
      "no_data": "لا توجد بيانات",
      "success": "نجحت العملية",
      "error": "حدث خطأ",
      "confirm_delete": "هل أنت متأكد من الحذف؟",
      
      // Language
      "language": "اللغة",
      "arabic": "العربية",
      "french": "الفرنسية",
      "english": "الإنجليزية",
      
      // Additional
      "active": "نشط",
      "inactive": "غير نشط",
      "relationship": "القرابة",
      "father": "أب",
      "mother": "أم",
      "guardian": "وصي",
      "select_student": "اختر طالباً",
      "select_students": "اختر الطلاب",
      "mark_attendance_for": "تسجيل الحضور لـ",
      "select_date": "اختر التاريخ",
      "today": "اليوم",
      "yesterday": "أمس",
      "this_week": "هذا الأسبوع",
      "this_month": "هذا الشهر",
      "all": "الكل",
      "select_class": "اختر الصف",
      "select_subject": "اختر المادة",
      "enter_score": "أدخل الدرجة",
      "out_of": "من",
      "weight": "الوزن",
      "semester": "الفصل",
      "academic_year": "السنة الدراسية",
      "first_semester": "الفصل الأول",
      "second_semester": "الفصل الثاني",
      "payment_history": "سجل المدفوعات",
      "pay_now": "ادفع الآن",
      "discount": "خصم",
      "scholarship": "منحة دراسية",
      "create_assignment": "إنشاء واجب",
      "due_in": "موعد التسليم",
      "submitted": "تم التسليم",
      "not_submitted": "لم يتم التسليم",
      "graded": "تم التقييم"
    }
  },
  fr: {
    translation: {
      // Auth
      "login": "Connexion",
      "logout": "Déconnexion",
      "username": "Nom d'utilisateur",
      "password": "Mot de passe",
      "select_role": "Sélectionner le rôle",
      "remember_me": "Se souvenir de moi",
      "forgot_password": "Mot de passe oublié?",
      "welcome_back": "Bienvenue",
      "login_subtitle": "Système intelligent de gestion scolaire",
      
      // Roles
      "super_admin": "Super Admin",
      "school_admin": "Directeur d'école",
      "teacher": "Enseignant",
      "student": "Étudiant",
      "parent": "Parent",
      
      // Navigation
      "dashboard": "Tableau de bord",
      "schools": "Écoles",
      "students": "Étudiants",
      "teachers": "Enseignants",
      "parents": "Parents",
      "attendance": "Présence",
      "grades": "Notes",
      "assignments": "Devoirs",
      "fees": "Frais",
      "payments": "Paiements",
      "settings": "Paramètres",
      
      // Actions
      "add": "Ajouter",
      "edit": "Modifier",
      "delete": "Supprimer",
      "save": "Enregistrer",
      "cancel": "Annuler",
      "search": "Rechercher",
      "filter": "Filtrer",
      "export": "Exporter",
      "view": "Voir",
      "submit": "Soumettre",
      
      // Dashboard
      "total_schools": "Total écoles",
      "total_students": "Total étudiants",
      "total_teachers": "Total enseignants",
      "total_parents": "Total parents",
      "present_today": "Présent aujourd'hui",
      "absent_today": "Absent aujourd'hui",
      "total_fees": "Total frais",
      "total_paid": "Payé",
      "total_pending": "En attente",
      
      // School Management
      "add_school": "Ajouter une école",
      "school_name": "Nom de l'école",
      "school_name_ar": "Nom en arabe",
      "school_name_fr": "Nom en français",
      "address": "Adresse",
      "phone": "Téléphone",
      "email": "E-mail",
      "admin_info": "Informations administrateur",
      "admin_username": "Nom d'utilisateur admin",
      "admin_password": "Mot de passe admin",
      "admin_full_name": "Nom complet admin",
      
      // Student Management
      "add_student": "Ajouter un étudiant",
      "student_info": "Informations étudiant",
      "full_name": "Nom complet",
      "class": "Classe",
      "grade": "Niveau",
      "date_of_birth": "Date de naissance",
      "parent": "Parent",
      "medical_info": "Informations médicales",
      
      // Teacher Management
      "add_teacher": "Ajouter un enseignant",
      "teacher_info": "Informations enseignant",
      "subjects": "Matières",
      "classes": "Classes",
      "specialization": "Spécialisation",
      
      // Attendance
      "mark_attendance": "Marquer la présence",
      "date": "Date",
      "status": "Statut",
      "present": "Présent",
      "absent": "Absent",
      "late": "En retard",
      "excused": "Absence excusée",
      "notes": "Notes",
      
      // Grades
      "add_grade": "Ajouter une note",
      "subject": "Matière",
      "assessment_type": "Type d'évaluation",
      "assessment_name": "Nom de l'évaluation",
      "score": "Score",
      "max_score": "Score maximum",
      "percentage": "Pourcentage",
      "exam": "Examen",
      "quiz": "Quiz",
      "homework": "Devoir",
      "project": "Projet",
      
      // Assignments
      "add_assignment": "Ajouter un devoir",
      "title": "Titre",
      "description": "Description",
      "due_date": "Date limite",
      "attachment": "Pièces jointes",
      
      // Fees
      "add_fee": "Ajouter des frais",
      "amount": "Montant",
      "fee_type": "Type de frais",
      "academic_year": "Année académique",
      "semester": "Semestre",
      "paid": "Payé",
      "pending": "En attente",
      "partial": "Partiel",
      "overdue": "En retard",
      "tuition": "Scolarité",
      "transport": "Transport",
      "books": "Livres",
      
      // Payments
      "add_payment": "Ajouter un paiement",
      "payment_method": "Méthode de paiement",
      "reference_number": "Numéro de référence",
      "payment_date": "Date de paiement",
      "cash": "Espèces",
      "bank_transfer": "Virement bancaire",
      "online": "En ligne",
      
      // Messages
      "loading": "Chargement...",
      "no_data": "Aucune donnée",
      "success": "Succès",
      "error": "Erreur",
      "confirm_delete": "Confirmer la suppression?",
      
      // Language
      "language": "Langue",
      "arabic": "Arabe",
      "french": "Français",
      "english": "Anglais",
      
      // Additional
      "active": "Actif",
      "inactive": "Inactif",
      "relationship": "Relation",
      "father": "Père",
      "mother": "Mère",
      "guardian": "Tuteur",
      "select_student": "Sélectionner un étudiant",
      "select_students": "Sélectionner les étudiants",
      "mark_attendance_for": "Marquer la présence pour",
      "select_date": "Sélectionner la date",
      "today": "Aujourd'hui",
      "yesterday": "Hier",
      "this_week": "Cette semaine",
      "this_month": "Ce mois-ci",
      "all": "Tous",
      "select_class": "Sélectionner la classe",
      "select_subject": "Sélectionner la matière",
      "enter_score": "Entrer la note",
      "out_of": "sur",
      "weight": "Poids",
      "semester": "Semestre",
      "academic_year": "Année académique",
      "first_semester": "Premier semestre",
      "second_semester": "Deuxième semestre",
      "payment_history": "Historique des paiements",
      "pay_now": "Payer maintenant",
      "discount": "Réduction",
      "scholarship": "Bourse",
      "create_assignment": "Créer un devoir",
      "due_in": "Date limite",
      "submitted": "Soumis",
      "not_submitted": "Non soumis",
      "graded": "Noté"
    }
  },
  en: {
    translation: {
      // Auth
      "login": "Login",
      "logout": "Logout",
      "username": "Username",
      "password": "Password",
      "select_role": "Select Role",
      "remember_me": "Remember Me",
      "forgot_password": "Forgot Password?",
      "welcome_back": "Welcome Back",
      "login_subtitle": "Smart School Management System",
      
      // Roles
      "super_admin": "Super Admin",
      "school_admin": "School Admin",
      "teacher": "Teacher",
      "student": "Student",
      "parent": "Parent",
      
      // Navigation
      "dashboard": "Dashboard",
      "schools": "Schools",
      "students": "Students",
      "teachers": "Teachers",
      "parents": "Parents",
      "attendance": "Attendance",
      "grades": "Grades",
      "assignments": "Assignments",
      "fees": "Fees",
      "payments": "Payments",
      "settings": "Settings",
      
      // Actions
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "save": "Save",
      "cancel": "Cancel",
      "search": "Search",
      "filter": "Filter",
      "export": "Export",
      "view": "View",
      "submit": "Submit",
      
      // Dashboard
      "total_schools": "Total Schools",
      "total_students": "Total Students",
      "total_teachers": "Total Teachers",
      "total_parents": "Total Parents",
      "present_today": "Present Today",
      "absent_today": "Absent Today",
      "total_fees": "Total Fees",
      "total_paid": "Total Paid",
      "total_pending": "Pending",
      
      // School Management
      "add_school": "Add School",
      "school_name": "School Name",
      "school_name_ar": "Name in Arabic",
      "school_name_fr": "Name in French",
      "address": "Address",
      "phone": "Phone",
      "email": "Email",
      "admin_info": "Admin Info",
      "admin_username": "Admin Username",
      "admin_password": "Admin Password",
      "admin_full_name": "Admin Full Name",
      
      // Student Management
      "add_student": "Add Student",
      "student_info": "Student Info",
      "full_name": "Full Name",
      "class": "Class",
      "grade": "Grade",
      "date_of_birth": "Date of Birth",
      "parent": "Parent",
      "medical_info": "Medical Info",
      
      // Teacher Management
      "add_teacher": "Add Teacher",
      "teacher_info": "Teacher Info",
      "subjects": "Subjects",
      "classes": "Classes",
      "specialization": "Specialization",
      
      // Attendance
      "mark_attendance": "Mark Attendance",
      "date": "Date",
      "status": "Status",
      "present": "Present",
      "absent": "Absent",
      "late": "Late",
      "excused": "Excused",
      "notes": "Notes",
      
      // Grades
      "add_grade": "Add Grade",
      "subject": "Subject",
      "assessment_type": "Assessment Type",
      "assessment_name": "Assessment Name",
      "score": "Score",
      "max_score": "Max Score",
      "percentage": "Percentage",
      "exam": "Exam",
      "quiz": "Quiz",
      "homework": "Homework",
      "project": "Project",
      
      // Assignments
      "add_assignment": "Add Assignment",
      "title": "Title",
      "description": "Description",
      "due_date": "Due Date",
      "attachment": "Attachment",
      
      // Fees
      "add_fee": "Add Fee",
      "amount": "Amount",
      "fee_type": "Fee Type",
      "academic_year": "Academic Year",
      "semester": "Semester",
      "paid": "Paid",
      "pending": "Pending",
      "partial": "Partial",
      "overdue": "Overdue",
      "tuition": "Tuition",
      "transport": "Transport",
      "books": "Books",
      
      // Payments
      "add_payment": "Add Payment",
      "payment_method": "Payment Method",
      "reference_number": "Reference Number",
      "payment_date": "Payment Date",
      "cash": "Cash",
      "bank_transfer": "Bank Transfer",
      "online": "Online",
      
      // Messages
      "loading": "Loading...",
      "no_data": "No Data",
      "success": "Success",
      "error": "Error",
      "confirm_delete": "Confirm Delete?",
      
      // Language
      "language": "Language",
      "arabic": "Arabic",
      "french": "French",
      "english": "English",
      
      // Additional
      "active": "Active",
      "inactive": "Inactive",
      "relationship": "Relationship",
      "father": "Father",
      "mother": "Mother",
      "guardian": "Guardian",
      "select_student": "Select Student",
      "select_students": "Select Students",
      "mark_attendance_for": "Mark Attendance For",
      "select_date": "Select Date",
      "today": "Today",
      "yesterday": "Yesterday",
      "this_week": "This Week",
      "this_month": "This Month",
      "all": "All",
      "select_class": "Select Class",
      "select_subject": "Select Subject",
      "enter_score": "Enter Score",
      "out_of": "out of",
      "weight": "Weight",
      "semester": "Semester",
      "academic_year": "Academic Year",
      "first_semester": "First Semester",
      "second_semester": "Second Semester",
      "payment_history": "Payment History",
      "pay_now": "Pay Now",
      "discount": "Discount",
      "scholarship": "Scholarship",
      "create_assignment": "Create Assignment",
      "due_in": "Due In",
      "submitted": "Submitted",
      "not_submitted": "Not Submitted",
      "graded": "Graded"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    lng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;