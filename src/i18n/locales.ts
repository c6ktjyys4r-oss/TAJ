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
    'nav.bank':         'Bank',

    // Search
    'nav.search.placeholder':       'Search documents, reports\u2026',
    'nav.search.placeholder.short': 'Search\u2026',
    'nav.search.shortcut':          'Keyboard shortcut Command K',
    'nav.search.ariaLabel':         'Search documents, reports\u2026 (Cmd+K)',
    'nav.openNav':                  'Open navigation menu',
    'nav.closeNav':                 'Close navigation menu',

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
    'action.review':    'Review',
    'action.generate':  'Generate Report',
    'action.sync':      'Sync Statements',
    'action.reorder':   'Reorder',
    'action.exitReorder': 'Exit Reorder',
    'action.clearFilters': 'Clear filters',

    // Status labels
    'status.classified':   'Classified',
    'status.unclassified': 'Unclassified',
    'status.needsReview':  'Needs Review',
    'status.processing':   'Processing',
    'status.ready':        'Ready',
    'status.uploading':    'Uploading',
    'status.active':       'Active',
    'status.comingSoon':   'Coming Soon',

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
    'page.ai.title':           'AI Intelligence',
    'page.designSystem.title': 'Design System',

    // Dashboard
    'dashboard.greeting':              'Good morning, Admin',
    'dashboard.subtitle':              'Here is what is happening across your financial workspace.',
    'dashboard.quickAccess':           'Quick Access',
    'dashboard.recentActivity':        'Recent Activity',
    'dashboard.recentActivity.sub':    'Last 24 hours',
    'dashboard.aiSuggestions':         'AI Suggestions',
    'dashboard.aiSuggestions.sub':     'Powered by TAJ Intelligence',
    'dashboard.live':                  'Live',
    'dashboard.stat.totalDocs':        'Total Documents',
    'dashboard.stat.classified':       'Classified',
    'dashboard.stat.thisMonth':        'This Month',
    'dashboard.stat.matchRate':        'Match Rate',

    // Launchpad descriptions
    'launchpad.documents.desc':    'Upload, classify, and manage financial documents',
    'launchpad.unclassified.desc': 'Review documents awaiting classification',
    'launchpad.bankMatching.desc': 'Reconcile transactions against bank statements',
    'launchpad.reports.desc':      'Generate and download financial reports',
    'launchpad.ai.desc':           'Get intelligent insights and automations',
    'launchpad.settings.desc':     'Configure your workspace and preferences',

    // Documents page
    'docs.subtitle':           '{count} of {total} documents',
    'docs.tab.all':            'All',
    'docs.tab.unclassified':   'Unclassified',
    'docs.tab.invoices':       'Invoices',
    'docs.tab.receipts':       'Receipts',
    'docs.tab.statements':     'Statements',
    'docs.filter.status':      'Status',
    'docs.filter.type':        'Type',
    'docs.noResults':          'No documents found',
    'docs.noResults.hint':     'Try adjusting your filters or upload new documents.',
    'docs.noResults.cta':      'Upload Documents',
    'docs.selected':           '{count} selected',
    'docs.reorder.hint':       'Drag rows to reorder. Click Exit Reorder when done.',
    'docs.reorder.dragHandle': 'Drag to reorder',

    // Reports page
    'reports.subtitle':         'Generate and manage financial reports',
    'reports.generate':         'Generate Report',
    'reports.allReports':       'All Reports',
    'reports.noMatch':          'No reports match the selected filters',
    'reports.stat.total':       'Total Reports',
    'reports.stat.thisMonth':   'This Month',
    'reports.stat.ready':       'Ready',
    'reports.stat.processing':  'Processing',
    'reports.print.title':      'Financial Reports',
    'reports.print.generated':  'Generated on',
    'reports.print.report':     'Report',
    'reports.print.type':       'Type',
    'reports.print.status':     'Status',
    'reports.print.date':       'Date',
    'reports.print.pages':      'Pages',

    // Bank Matching page
    'bankMatching.subtitle':         'Reconcile transactions against your financial records',
    'bankMatching.sync':             'Sync Statements',
    'bankMatching.stat.total':       'Total Transactions',
    'bankMatching.stat.matched':     'Matched',
    'bankMatching.stat.pending':     'Pending Review',
    'bankMatching.stat.avgRate':     'Avg Match Rate',
    'bankMatching.pendingReview':    'Pending Review',
    'bankMatching.pendingSubtitle':  '{count} transactions need manual attention',
    'bankMatching.review':           'Review',

    // AI page
    'ai.subtitle':        "TAJ's AI engine works continuously to automate your financial workflows.",
    'ai.capabilities':    'AI Capabilities',
    'ai.stat.processed':  'Documents Processed',
    'ai.stat.classified': 'Auto-classified',
    'ai.stat.timeSaved':  'Time Saved',
    'ai.stat.confidence': 'AI Confidence',
    'ai.hint':            'The AI Assistant is always available via the floating button — ask it anything about your documents, reports, or reconciliation status.',

    // Settings
    'settings.general':             'General',
    'settings.ai':                  'AI & Automation',
    'settings.notifications':       'Notifications',
    'settings.appearance':          'Appearance',
    'settings.team':                'Team',
    'settings.security':            'Security',
    'settings.rtl':                 'Arabic (RTL) layout',
    'settings.rtl.hint':            'Switch the interface to right-to-left for Arabic users',
    'settings.aiCompanion':         'AI Companion',
    'settings.aiCompanion.hint':    'Show the floating AI chat assistant across all pages',
    'settings.emailNotif':          'Email notifications',
    'settings.pushNotif':           'Browser push notifications',
    'settings.digest':              'Daily digest',
    'settings.colourTheme':         'Colour Theme',
    'settings.darkMode.note':       'Dark mode is not available in this version.',
    'settings.futureRelease':       'This section is available in a future release.',
    'settings.colourTheme.default': 'Gold & White (Default)',
    'settings.colourTheme.slate':   'Slate Blue',
    'settings.colourTheme.forest':  'Forest',
    'settings.notifEnabled':        'Enabled',
    'settings.notifDenied':         'Blocked by browser',
    'settings.notifDefault':        'Not yet requested',
    'settings.notifRequest':        'Request permission',
    'settings.notifTest':           'Send test notification',
    'settings.saved':               'Saved',

    // Settings — Data Portability
    'settings.dataPortability':      'Data Portability',
    'settings.dataPortability.hint': 'Export your preferences to restore them on a new device.',
    'settings.export':               'Export Settings',
    'settings.import':               'Import Settings',
    'settings.export.success':       'Settings exported',
    'settings.import.success':       'Settings imported successfully',
    'settings.import.error':         'Invalid settings file — please check the format and try again.',
    'settings.import.ariaLabel':     'Select settings JSON file to import',

    // Onboarding
    'onboarding.welcome.title': 'Welcome to TAJ Finance',
    'onboarding.skip':          'Skip tour',
    'onboarding.getStarted':    'Get started',

    // Upload
    'upload.title':       'Upload Documents',
    'upload.description': 'Supported formats: PDF, JPG, PNG, XLSX \u2014 up to 20 MB each',
    'upload.dragHere':    'Drag files here, or browse',
    'upload.takePhoto':   'Take a photo',
    'upload.done':        'Done',
    'upload.uploading':   'Uploading',
    'upload.ready':       'Ready',
    'upload.error':       'Error',
    'upload.filesOf':     '{done} of {total} file{plural} uploaded',

    // Errors
    'error.title':   'Something went wrong',
    'error.message': 'An unexpected error occurred. The team has been notified.',

    // Offline / PWA
    'offline.message': 'You are offline \u2014 the app is available but some features are limited',
    'online.message':  'Back online \u2014 all features restored',
    'update.available': 'A new version is available',
    'update.dismiss':   'Dismiss update notification',

    // Accessibility
    'a11y.skipToMain':  'Skip to main content',
    'a11y.tajHome':     'TAJ Finance \u2014 go to Dashboard',
    'a11y.closeDialog': 'Close dialog',
  },

  ar: {
    // Navigation
    'nav.dashboard':    '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645',
    'nav.documents':    '\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
    'nav.reports':      '\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631',
    'nav.bankMatching': '\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0628\u0646\u0643',
    'nav.ai':           '\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    'nav.settings':     '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    'nav.bank':         '\u0627\u0644\u0628\u0646\u0643',

    // Search
    'nav.search.placeholder':       '\u0627\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0648\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631\u2026',
    'nav.search.placeholder.short': '\u0628\u062d\u062b\u2026',
    'nav.search.shortcut':          '\u0627\u062e\u062a\u0635\u0627\u0631 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0641\u0627\u062a\u064a\u062d',
    'nav.search.ariaLabel':         '\u0627\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u2026',
    'nav.openNav':                  '\u0641\u062a\u062d \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062a\u0646\u0642\u0644',
    'nav.closeNav':                 '\u0625\u063a\u0644\u0627\u0642 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062a\u0646\u0642\u0644',

    // Common actions
    'action.upload':    '\u0631\u0641\u0639',
    'action.export':    '\u062a\u0635\u062f\u064a\u0631',
    'action.download':  '\u062a\u0646\u0632\u064a\u0644',
    'action.delete':    '\u062d\u0630\u0641',
    'action.classify':  '\u062a\u0635\u0646\u064a\u0641',
    'action.share':     '\u0645\u0634\u0627\u0631\u0643\u0629',
    'action.search':    '\u0628\u062d\u062b',
    'action.filter':    '\u062a\u0635\u0641\u064a\u0629',
    'action.cancel':    '\u0625\u0644\u063a\u0627\u0621',
    'action.save':      '\u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a',
    'action.close':     '\u0625\u063a\u0644\u0627\u0642',
    'action.next':      '\u0627\u0644\u062a\u0627\u0644\u064a',
    'action.back':      '\u0631\u062c\u0648\u0639',
    'action.done':      '\u062a\u0645',
    'action.install':   '\u062a\u062b\u0628\u064a\u062a \u0627\u0644\u062a\u0637\u0628\u064a\u0642',
    'action.update':    '\u062a\u062d\u062f\u064a\u062b',
    'action.reload':    '\u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642',
    'action.review':    '\u0645\u0631\u0627\u062c\u0639\u0629',
    'action.generate':  '\u0625\u0646\u0634\u0627\u0621 \u062a\u0642\u0631\u064a\u0631',
    'action.sync':      '\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0643\u0634\u0648\u0641\u0627\u062a',
    'action.reorder':   '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0631\u062a\u064a\u0628',
    'action.exitReorder': '\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0648\u0636\u0639 \u0627\u0644\u062a\u0631\u062a\u064a\u0628',
    'action.clearFilters': '\u0645\u0633\u062d \u0627\u0644\u062a\u0635\u0641\u064a\u0629',

    // Status labels
    'status.classified':   '\u0645\u0635\u0646\u0651\u0641',
    'status.unclassified': '\u063a\u064a\u0631 \u0645\u0635\u0646\u0651\u0641',
    'status.needsReview':  '\u064a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629',
    'status.processing':   '\u0642\u064a\u062f \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629',
    'status.ready':        '\u062c\u0627\u0647\u0632',
    'status.uploading':    '\u062c\u0627\u0631\u064d \u0627\u0644\u0631\u0641\u0639',
    'status.active':       '\u0646\u0634\u0637',
    'status.comingSoon':   '\u0642\u0631\u064a\u0628\u0627\u064b',

    // Document types
    'type.invoice':   '\u0641\u0627\u062a\u0648\u0631\u0629',
    'type.receipt':   '\u0625\u064a\u0635\u0627\u0644',
    'type.statement': '\u0643\u0634\u0641 \u062d\u0633\u0627\u0628',
    'type.contract':  '\u0639\u0642\u062f',

    // Pages
    'page.dashboard.title':    '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645',
    'page.documents.title':    '\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
    'page.reports.title':      '\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631',
    'page.bankMatching.title': '\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0628\u0646\u0643',
    'page.settings.title':     '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    'page.ai.title':           '\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    'page.designSystem.title': '\u0646\u0638\u0627\u0645 \u0627\u0644\u062a\u0635\u0645\u064a\u0645',

    // Dashboard
    'dashboard.greeting':           '\u0635\u0628\u0627\u062d \u0627\u0644\u062e\u064a\u0631\u060c \u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645',
    'dashboard.subtitle':           '\u0625\u0644\u064a\u0643 \u0622\u062e\u0631 \u0645\u0627 \u064a\u062c\u0631\u064a \u0639\u0628\u0631 \u0645\u0633\u0627\u062d\u062a\u0643 \u0627\u0644\u0645\u0627\u0644\u064a\u0629.',
    'dashboard.quickAccess':        '\u0648\u0635\u0648\u0644 \u0633\u0631\u064a\u0639',
    'dashboard.recentActivity':     '\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u062e\u064a\u0631',
    'dashboard.recentActivity.sub': '\u0622\u062e\u0631 24 \u0633\u0627\u0639\u0629',
    'dashboard.aiSuggestions':      '\u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    'dashboard.aiSuggestions.sub':  '\u0645\u062f\u0639\u0648\u0645\u0629 \u0628\u0630\u0643\u0627\u0621 TAJ',
    'dashboard.live':               '\u0645\u0628\u0627\u0634\u0631',
    'dashboard.stat.totalDocs':     '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
    'dashboard.stat.classified':    '\u0645\u0635\u0646\u0651\u0641\u0629',
    'dashboard.stat.thisMonth':     '\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631',
    'dashboard.stat.matchRate':     '\u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629',

    // Launchpad descriptions
    'launchpad.documents.desc':    '\u0631\u0641\u0639 \u0648\u062a\u0635\u0646\u064a\u0641 \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u0645\u0627\u0644\u064a\u0629',
    'launchpad.unclassified.desc': '\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0646\u062a\u0638\u0631 \u0627\u0644\u062a\u0635\u0646\u064a\u0641',
    'launchpad.bankMatching.desc': '\u062a\u0633\u0648\u064a\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0645\u0639 \u0643\u0634\u0648\u0641\u0627\u062a \u0627\u0644\u0628\u0646\u0643',
    'launchpad.reports.desc':      '\u0625\u0646\u0634\u0627\u0621 \u0648\u062a\u0646\u0632\u064a\u0644 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0627\u0644\u064a\u0629',
    'launchpad.ai.desc':           '\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0631\u0624\u0649 \u0630\u0643\u064a\u0629 \u0648\u0623\u062a\u0645\u062a\u0629',
    'launchpad.settings.desc':     '\u0636\u0628\u0637 \u0645\u0633\u0627\u062d\u062a\u0643 \u0648\u062a\u0641\u0636\u064a\u0644\u0627\u062a\u0643',

    // Documents page
    'docs.subtitle':           '{count} \u0645\u0646 {total} \u0645\u0633\u062a\u0646\u062f',
    'docs.tab.all':            '\u0627\u0644\u0643\u0644',
    'docs.tab.unclassified':   '\u063a\u064a\u0631 \u0645\u0635\u0646\u0651\u0641\u0629',
    'docs.tab.invoices':       '\u0641\u0648\u0627\u062a\u064a\u0631',
    'docs.tab.receipts':       '\u0625\u064a\u0635\u0627\u0644\u0627\u062a',
    'docs.tab.statements':     '\u0643\u0634\u0648\u0641 \u062d\u0633\u0627\u0628',
    'docs.filter.status':      '\u0627\u0644\u062d\u0627\u0644\u0629',
    'docs.filter.type':        '\u0627\u0644\u0646\u0648\u0639',
    'docs.noResults':          '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u062a\u0646\u062f\u0627\u062a',
    'docs.noResults.hint':     '\u062c\u0631\u0651\u0628 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629 \u0623\u0648 \u0631\u0641\u0639 \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u062c\u062f\u064a\u062f\u0629.',
    'docs.noResults.cta':      '\u0631\u0641\u0639 \u0645\u0633\u062a\u0646\u062f\u0627\u062a',
    'docs.selected':           '{count} \u0645\u062d\u062f\u062f',
    'docs.reorder.hint':       '\u0627\u0633\u062d\u0628 \u0627\u0644\u0635\u0641\u0648\u0641 \u0644\u0625\u0639\u0627\u062f\u0629 \u062a\u0631\u062a\u064a\u0628\u0647\u0627.',
    'docs.reorder.dragHandle': '\u0627\u0633\u062d\u0628 \u0644\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0631\u062a\u064a\u0628',

    // Reports page
    'reports.subtitle':         '\u0625\u0646\u0634\u0627\u0621 \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0627\u0644\u064a\u0629',
    'reports.generate':         '\u0625\u0646\u0634\u0627\u0621 \u062a\u0642\u0631\u064a\u0631',
    'reports.allReports':       '\u062c\u0645\u064a\u0639 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631',
    'reports.noMatch':          '\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u0627\u0631\u064a\u0631 \u062a\u0637\u0627\u0628\u0642 \u0627\u0644\u062a\u0635\u0641\u064a\u0629',
    'reports.stat.total':       '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631',
    'reports.stat.thisMonth':   '\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631',
    'reports.stat.ready':       '\u062c\u0627\u0647\u0632',
    'reports.stat.processing':  '\u0642\u064a\u062f \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629',
    'reports.print.title':      '\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0627\u0644\u064a\u0629',
    'reports.print.generated':  '\u062a\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0641\u064a',
    'reports.print.report':     '\u0627\u0644\u062a\u0642\u0631\u064a\u0631',
    'reports.print.type':       '\u0627\u0644\u0646\u0648\u0639',
    'reports.print.status':     '\u0627\u0644\u062d\u0627\u0644\u0629',
    'reports.print.date':       '\u0627\u0644\u062a\u0627\u0631\u064a\u062e',
    'reports.print.pages':      '\u0627\u0644\u0635\u0641\u062d\u0627\u062a',

    // Bank Matching page
    'bankMatching.subtitle':         '\u062a\u0633\u0648\u064a\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0645\u0639 \u0633\u062c\u0644\u0627\u062a\u0643 \u0627\u0644\u0645\u0627\u0644\u064a\u0629',
    'bankMatching.sync':             '\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0643\u0634\u0648\u0641\u0627\u062a',
    'bankMatching.stat.total':       '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a',
    'bankMatching.stat.matched':     '\u0645\u062a\u0637\u0627\u0628\u0642',
    'bankMatching.stat.pending':     '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
    'bankMatching.stat.avgRate':     '\u0645\u062a\u0648\u0633\u0637 \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629',
    'bankMatching.pendingReview':    '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
    'bankMatching.pendingSubtitle':  '{count} \u0645\u0639\u0627\u0645\u0644\u0629 \u062a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629 \u064a\u062f\u0648\u064a\u0629',
    'bankMatching.review':           '\u0645\u0631\u0627\u062c\u0639\u0629',

    // AI page
    'ai.subtitle':        '\u0645\u062d\u0631\u0643 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0641\u064a TAJ \u064a\u0639\u0645\u0644 \u0628\u0627\u0633\u062a\u0645\u0631\u0627\u0631.',
    'ai.capabilities':    '\u0625\u0645\u0643\u0627\u0646\u064a\u0627\u062a \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    'ai.stat.processed':  '\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0645\u0639\u0627\u0644\u062c\u0629',
    'ai.stat.classified': '\u062a\u0645 \u062a\u0635\u0646\u064a\u0641\u0647\u0627 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b',
    'ai.stat.timeSaved':  '\u0648\u0642\u062a \u0645\u0648\u0641\u0651\u0631',
    'ai.stat.confidence': '\u062b\u0642\u0629 \u0627\u0644\u0630\u0643\u0627\u0621',
    'ai.hint':            '\u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a \u0645\u062a\u0627\u062d \u062f\u0627\u0626\u0645\u0627\u064b \u0639\u0628\u0631 \u0632\u0631 \u0627\u0644\u062a\u0639\u0648\u064a\u0645.',

    // Settings
    'settings.general':             '\u0639\u0627\u0645',
    'settings.ai':                  '\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0648\u0627\u0644\u0623\u062a\u0645\u062a\u0629',
    'settings.notifications':       '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
    'settings.appearance':          '\u0627\u0644\u0645\u0638\u0647\u0631',
    'settings.team':                '\u0627\u0644\u0641\u0631\u064a\u0642',
    'settings.security':            '\u0627\u0644\u0623\u0645\u0627\u0646',
    'settings.rtl':                 '\u0648\u0627\u062c\u0647\u0629 \u0639\u0631\u0628\u064a\u0629 (RTL)',
    'settings.rtl.hint':            '\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0648\u0627\u062c\u0647\u0629 \u0625\u0644\u0649 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u064a\u0645\u064a\u0646 \u0644\u0644\u064a\u0633\u0627\u0631',
    'settings.aiCompanion':         '\u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a',
    'settings.aiCompanion.hint':    '\u0639\u0631\u0636 \u0645\u0633\u0627\u0639\u062f \u0627\u0644\u062f\u0631\u062f\u0634\u0629 \u0627\u0644\u0630\u0643\u064a \u0639\u0644\u0649 \u062c\u0645\u064a\u0639 \u0627\u0644\u0635\u0641\u062d\u0627\u062a',
    'settings.emailNotif':          '\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
    'settings.pushNotif':           '\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u0635\u0641\u062d',
    'settings.digest':              '\u0645\u0644\u062e\u0635 \u064a\u0648\u0645\u064a',
    'settings.colourTheme':         '\u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0644\u0648\u0627\u0646',
    'settings.darkMode.note':       '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0625\u0635\u062f\u0627\u0631.',
    'settings.futureRelease':       '\u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0645\u062a\u0627\u062d \u0641\u064a \u0625\u0635\u062f\u0627\u0631 \u0645\u0633\u062a\u0642\u0628\u0644\u064a.',
    'settings.colourTheme.default': '\u0630\u0647\u0628\u064a \u0648\u0623\u0628\u064a\u0636 (\u0627\u0641\u062a\u0631\u0627\u0636\u064a)',
    'settings.colourTheme.slate':   '\u0623\u0632\u0631\u0642 \u0631\u0645\u0627\u062f\u064a',
    'settings.colourTheme.forest':  '\u063a\u0627\u0628\u064a',
    'settings.notifEnabled':        '\u0645\u0641\u0639\u0651\u0644',
    'settings.notifDenied':         '\u0645\u062d\u062c\u0648\u0628 \u0645\u0646 \u0627\u0644\u0645\u062a\u0635\u0641\u062d',
    'settings.notifDefault':        '\u0644\u0645 \u064a\u064f\u0637\u0644\u0628 \u0628\u0639\u062f',
    'settings.notifRequest':        '\u0637\u0644\u0628 \u0627\u0644\u0625\u0630\u0646',
    'settings.notifTest':           '\u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u062a\u062c\u0631\u064a\u0628\u064a',
    'settings.saved':               '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638',

    // Settings — Data Portability
    'settings.dataPortability':      '\u0646\u0642\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a',
    'settings.dataPortability.hint': '\u0635\u062f\u0651\u0631 \u062a\u0641\u0636\u064a\u0644\u0627\u062a\u0643 \u0644\u0627\u0633\u062a\u0639\u0627\u062f\u062a\u0647\u0627 \u0639\u0644\u0649 \u062c\u0647\u0627\u0632 \u062c\u062f\u064a\u062f.',
    'settings.export':               '\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    'settings.import':               '\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    'settings.export.success':       '\u062a\u0645 \u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    'settings.import.success':       '\u062a\u0645 \u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0628\u0646\u062c\u0627\u062d',
    'settings.import.error':         '\u0645\u0644\u0641 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u063a\u064a\u0631 \u0635\u0627\u0644\u062d \u2014 \u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u0648\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.',
    'settings.import.ariaLabel':     '\u062a\u062d\u062f\u064a\u062f \u0645\u0644\u0641 JSON \u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',

    // Onboarding
    'onboarding.welcome.title': '\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0641\u064a TAJ Finance',
    'onboarding.skip':          '\u062a\u062e\u0637\u064a \u0627\u0644\u062c\u0648\u0644\u0629',
    'onboarding.getStarted':    '\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646',

    // Upload
    'upload.title':       '\u0631\u0641\u0639 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
    'upload.description': '\u0627\u0644\u0635\u064a\u063a \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629: PDF\u060c JPG\u060c PNG\u060c XLSX \u2014 \u062d\u062a\u0649 20 \u0645\u064a\u063a\u0627\u0628\u0627\u064a\u062a',
    'upload.dragHere':    '\u0627\u0633\u062d\u0628 \u0627\u0644\u0645\u0644\u0641\u0627\u062a \u0647\u0646\u0627 \u0623\u0648 \u062a\u0635\u0641\u062d',
    'upload.takePhoto':   '\u0627\u0644\u062a\u0642\u0627\u0637 \u0635\u0648\u0631\u0629',
    'upload.done':        '\u062a\u0645',
    'upload.uploading':   '\u062c\u0627\u0631\u064d \u0627\u0644\u0631\u0641\u0639',
    'upload.ready':       '\u062c\u0627\u0647\u0632',
    'upload.error':       '\u062e\u0637\u0623',
    'upload.filesOf':     '\u062a\u0645 \u0631\u0641\u0639 {done} \u0645\u0646 \u0623\u0635\u0644 {total}',

    // Errors
    'error.title':   '\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627',
    'error.message': '\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639. \u062a\u0645 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0641\u0631\u064a\u0642.',

    // Offline / PWA
    'offline.message':  '\u0623\u0646\u062a \u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u2014 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0645\u062a\u0627\u062d \u0644\u0643\u0646 \u0628\u0639\u0636 \u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0645\u062d\u062f\u0648\u062f\u0629',
    'online.message':   '\u0639\u062f\u062a \u0644\u0644\u0627\u062a\u0635\u0627\u0644 \u2014 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0645\u062a\u0627\u062d\u0629',
    'update.available': '\u064a\u062a\u0648\u0641\u0631 \u0625\u0635\u062f\u0627\u0631 \u062c\u062f\u064a\u062f',
    'update.dismiss':   '\u0625\u062e\u0641\u0627\u0621 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u062a\u062d\u062f\u064a\u062b',

    // Accessibility
    'a11y.skipToMain':  '\u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a',
    'a11y.tajHome':     'TAJ Finance \u2014 \u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645',
    'a11y.closeDialog': '\u0625\u063a\u0644\u0627\u0642 \u0645\u0631\u0628\u0639 \u0627\u0644\u062d\u0648\u0627\u0631',
  },
};
