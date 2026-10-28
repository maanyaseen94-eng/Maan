// ===== إعدادات النظام =====
// 1) ضع إعدادات مشروع Firebase هنا (من Project settings > Your apps > Web app)
//    إذا تركتها null يشتغل النظام بوضع تجريبي على نفس الجهاز فقط.
export const FIREBASE_CONFIG = null;
/* مثال:
export const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
*/

// 2) بيانات المكتب
export const OFFICE = {
  title: "النائب المهندس",
  name: "عدي عواد الحسين",
  roles: ["رئيس كتلة الصادقون النيابية", "رئيس اللجنة المالية"],
  address: "البصرة - حي الخليج العربي - بناية مجلس النواب العراقي ص.ب (184)",
  phones: ["07722945824", "07702818058", "07833555185"],
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
