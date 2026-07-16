/**
 * TAJ Finance — i18n locale map
 * Keys are used throughout the app via the `useT` hook.
 * Arabic translations are provided for all user-facing strings.
 * New strings should be added here in both locales before use.
 */
export type Locale = 'en' | 'ar';

export const locales: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard':    'Dashboard',
    'nav.documents':    'Documents',
    'nav.reports':      'Reports',
    'nav.bankMatching': 'Bank Matching',
    'nav.ai':           'AI',
    'nav.settings':     'Settings',

    // Common actions
    'action.upload':    'Upload',
    'action.export':    'Export',
    'action.download':  'Download',
    'action.delete':    'Delete',
    'action.classify':  'Classify',
    'action.share':     'Share',
    'action.search':    'Search',
    'action.filter':    'Filter',
    'action.cancel':    'Cancel',
    'action.save':      'Save Changes',
    'action.close':     'Close',
    'action.next':      'Next',
    'action.back':      'Back',
    'action.done':      'Done',
    'action.install':   'Install App',
    'action.update':    'Update',
    'action.reload':    'Reload application',

    // Status labels
    'status.classified':   'Classified',
    'status.unclassified': 'Unclassified',
    'status.needsReview':  'Needs Review',
    'status.processing':   'Processing',
    'status.ready':        'Ready',
    'status.uploading':    'Uploading',

    // Document types
    'type.invoice':   'Invoice',
    'type.receipt':   'Receipt',
    'type.statement': 'Statement',
    'type.contract':  'Contract',

    // Pages
    'page.dashboard.title':    'Dashboard',
    'page.documents.title':    'Documents',
    'page.reports.title':      'Reports',
    'page.bankMatching.title': 'Bank Matching',
    'page.settings.title':     'Settings',
    'page.ai.title':           'AI Assistant',
    'page.designSystem.title': 'Design System',

    // Settings
    'settings.general':          'General',
    'settings.ai':               'AI & Automation',
    'settings.notifications':    'Notifications',
    'settings.appearance':       'Appearance',
    'settings.team':             'Team',
    'settings.security':         'Security',
    'settings.rtl':              'Arabic (RTL) layout',
    'settings.rtl.hint':         'Switch the interface to right-to-left for Arabic users',
    'settings.aiCompanion':      'AI Companion',
    'settings.aiCompanion.hint': 'Show the floating AI chat assistant across all pages',
    'settings.emailNotif':       'Email notifications',
    'settings.pushNotif':        'Browser push notifications',
    'settings.digest':           'Daily digest',

    // Onboarding
    'onboarding.welcome.title': 'Welcome to TAJ Finance',
    'onboarding.skip':          'Skip tour',
    'onboarding.getStarted':    'Get started',

    // Upload
    'upload.title':       'Upload Documents',
    'upload.description': 'Supported formats: PDF, JPG, PNG, XLSX — up to 20 MB each',
    'upload.dragHere':    'Drag files here, or browse',
    'upload.takePhoto':   'Take a photo',

    // Errors
    'error.title':   'Something went wrong',
    'error.message': 'An unexpected error occurred. The team has been notified.',

    // Offline
    'offline.message': 'You are offline — the app is available but some features are limited',
    'online.message':  'Back online — all features restored',

    // Update
    'update.available': 'A new version is available',
  },

  ar: {
    // Navigation
    'nav.dashboard':    'لوحة التحكم',
    'nav.documents':    'المستندات',
    'nav.reports':      'التقارير',
    'nav.bankMatching': 'مطابقة البنك',
    'nav.ai':           'الذكاء الاصطناعي',
    'nav.settings':     'الإعدادات',

    // Common actions
    'action.upload':    'رفع',
    'action.export':    'تصدير',
    'action.download':  'تنزيل',
    'action.delete':    'حذف',
    'action.classify':  'تصنيف',
    'action.share':     'مشاركة',
    'action.search':    'بحث',
    'action.filter':    'تصفية',
    'action.cancel':    'إلغاء',
    'action.save':      'حفظ التغييرات',
    'action.close':     'إغلاق',
    'action.next':      'التالي',
    'action.back':      'رجوع',
    'action.done':      'تم',
    'action.install':   'تثبيت التطبيق',
    'action.update':    'تحديث',
    'action.reload':    'إعادة تحميل التطبيق',

    // Status labels
    'status.classified':   'مصنّف',
    'status.unclassified': 'غير مصنّف',
    'status.needsReview':  'يحتاج مراجعة',
    'status.processing':   'قيد المعالجة',
    'status.ready':        'جاهز',
    'status.uploading':    'جارٍ الرفع',

    // Document types
    'type.invoice':   'فاتورة',
    'type.receipt':   'إيصال',
    'type.statement': 'كشف حساب',
    'type.contract':  'عقد',

    // Pages
    'page.dashboard.title':    'لوحة التحكم',
    'page.documents.title':    'المستندات',
    'page.reports.title':      'التقارير',
    'page.bankMatching.title': 'مطابقة البنك',
    'page.settings.title':     'الإعدادات',
    'page.ai.title':           'المساعد الذكي',
    'page.designSystem.title': 'نظام التصميم',

    // Settings
    'settings.general':          'عام',
    'settings.ai':               'الذكاء الاصطناعي والأتمتة',
    'settings.notifications':    'الإشعارات',
    'settings.appearance':       'المظهر',
    'settings.team':             'الفريق',
    'settings.security':         'الأمان',
    'settings.rtl':              'واجهة عربية (RTL)',
    'settings.rtl.hint':         'تبديل الواجهة إلى اتجاه اليمين لليسار للمستخدمين العرب',
    'settings.aiCompanion':      'المساعد الذكي',
    'settings.aiCompanion.hint': 'عرض مساعد الدردشة الذكي على جميع الصفحات',
    'settings.emailNotif':       'إشعارات البريد الإلكتروني',
    'settings.pushNotif':        'إشعارات المتصفح',
    'settings.digest':           'ملخص يومي',

    // Onboarding
    'onboarding.welcome.title': 'مرحباً بك في TAJ Finance',
    'onboarding.skip':          'تخطي الجولة',
    'onboarding.getStarted':    'ابدأ الآن',

    // Upload
    'upload.title':       'رفع المستندات',
    'upload.description': 'الصيغ المدعومة: PDF، JPG، PNG، XLSX — حتى 20 ميغابايت لكل ملف',
    'upload.dragHere':    'اسحب الملفات هنا أو تصفح',
    'upload.takePhoto':   'التقاط صورة',

    // Errors
    'error.title':   'حدث خطأ ما',
    'error.message': 'حدث خطأ غير متوقع. تم إشعار الفريق.',

    // Offline
    'offline.message': 'أنت غير متصل بالإنترنت — التطبيق متاح لكن بعض الميزات محدودة',
    'online.message':  'عدت للاتصال — جميع الميزات متاحة',

    // Update
    'update.available': 'يتوفر إصدار جديد',
  },
};
