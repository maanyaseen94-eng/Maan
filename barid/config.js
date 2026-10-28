// ===== إعدادات النظام =====
// 1) إعدادات مشروع Firebase (barid-oday-awad)
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA2eRLWNljpz5zpdsbtvwHE8pSydGlStvY",
  authDomain: "barid-oday-awad.firebaseapp.com",
  projectId: "barid-oday-awad",
  storageBucket: "barid-oday-awad.firebasestorage.app",
  messagingSenderId: "44474800018",
  appId: "1:44474800018:web:54841f0024751d32e8934b",
};

// مسؤول النظام: يگدر يضيف ويحذف حسابات الموظفين
export const OWNER_EMAIL = "maanyaseen94@gmail.com";

// 2) بيانات المكتب
export const OFFICE = {
  title: "النائب المهندس",
  name: "عدي عواد الحسين",
  roles: ["رئيس كتلة الصادقون النيابية", "رئيس اللجنة المالية"],
  address: "بغداد - مجلس النواب العراقي - قصر المؤتمرات ( ص.ب 184 )",
  phones: ["07753301166", "07853301166"],
  email: "office@odayawad.com",
};

// 3) أنواع الكتب والمدة المتوقعة للإنجاز (بالأيام)
export const LETTER_TYPES = [
  { name: "طلب تعيين", days: 30 },
  { name: "طلب علاج", days: 7 },
  { name: "طلب نقل", days: 21 },
  { name: "طلب مساعدة", days: 14 },
  { name: "شكوى", days: 14 },
  { name: "معاملة رسمية", days: 21 },
  { name: "أخرى", days: 15 },
];

// 4) المراحل الجاهزة (تظهر كخيارات سريعة عند إضافة مرحلة)
export const STAGE_PRESETS = [
  "استلام الطلب في المكتب",
  "صدور الكتاب",
  "إرسال الكتاب إلى الجهة المعنية",
  "قيد المعالجة لدى الجهة",
  "متابعة من مكتب النائب",
  "ورود الإجابة",
  "إكمال الطلب",
];
