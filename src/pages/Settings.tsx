import React, { useState, useRef } from 'react';
import { Sparkles, Bell, Globe, Shield, Users, Palette, BellRing, BellOff, Download, Upload } from 'lucide-react';
import { AiSettings } from '../components/settings/AiSettings';
import { PageTitle } from '../components/ui/Typography';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../hooks/useNotifications';
import { useT } from '../hooks/useT';

export const Settings: React.FC = () => {
  const t = useT();
  const {
    aiCompanionEnabled, setAiCompanionEnabled,
    notificationsEmail, setNotificationsEmail,
    notificationsPush,  setNotificationsPush,
    notificationsDigest, setNotificationsDigest,
    isRTL, setIsRTL,
    exportSettings, importSettings,
  } = useSettings();
  const { supported: notifSupported, permission, requestPermission, notify } = useNotifications();

  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved]                 = useState(false);
  const [importMsg, setImportMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const importInputRef                    = useRef<HTMLInputElement>(null);

  const SECTIONS = [
    { id: 'general',       label: t('settings.general'),       icon: Globe     },
    { id: 'ai',            label: t('settings.ai'),            icon: Sparkles  },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell      },
    { id: 'appearance',    label: t('settings.appearance'),    icon: Palette   },
    { id: 'team',          label: t('settings.team'),          icon: Users     },
    { id: 'security',      label: t('settings.security'),      icon: Shield    },
  ];

  interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; }
  const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, hint }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink-primary">{label}</p>
        {hint && <p className="text-xs text-ink-muted mt-0.5">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1 ${
          checked ? 'bg-gold-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestNotification = () => {
    notify('TAJ Finance', { body: 'Test notification \u2014 everything is working correctly.' });
  };

  const handleExport = () => {
    exportSettings();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result;
      if (typeof json !== 'string') return;
      const ok = importSettings(json);
      setImportMsg({
        ok,
        text: ok ? t('settings.import.success') : t('settings.import.error'),
      });
      setTimeout(() => setImportMsg(null), 4000);
      // Reset input so the same file can be re-selected
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const permissionLabel: Record<string, string> = {
    granted: t('settings.notifEnabled'),
    denied:  t('settings.notifDenied'),
    default: t('settings.notifDefault'),
  };

  return (
    <div className="space-y-6">
      <PageTitle>{t('page.settings.title')}</PageTitle>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-48 shrink-0" aria-label={t('page.settings.title')}>
          <nav className="space-y-0.5" role="navigation" aria-label="Settings navigation">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                aria-current={activeSection === id ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  activeSection === id
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-gray-50'
                }`}
              >
                <Icon size={15} aria-hidden="true" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'general' && (
            <div className="space-y-4">
              <Card padding="md">
                <CardHeader title="Profile" subtitle="Your account information" />
                <div className="space-y-3 mt-2">
                  <Input label="Full Name" defaultValue="Admin User" />
                  <Input label="Email" type="email" defaultValue="admin@tajfinance.sa" />
                  <Input label="Organisation" defaultValue="TAJ Enterprise" />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} size="sm">
                    {saved ? t('settings.saved') : t('action.save')}
                  </Button>
                </div>
              </Card>

              {/* Data Portability */}
              <Card padding="md">
                <CardHeader
                  title={t('settings.dataPortability')}
                  subtitle={t('settings.dataPortability.hint')}
                />
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={13} aria-hidden="true" />}
                    onClick={handleExport}
                  >
                    {t('settings.export')}
                  </Button>

                  <>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept="application/json,.json"
                      className="sr-only"
                      aria-label={t('settings.import.ariaLabel')}
                      onChange={handleImportFile}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Upload size={13} aria-hidden="true" />}
                      onClick={() => importInputRef.current?.click()}
                    >
                      {t('settings.import')}
                    </Button>
                  </>

                  {importMsg && (
                    <span
                      className={`text-xs font-medium ${importMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}
                      role="status"
                      aria-live="polite"
                    >
                      {importMsg.text}
                    </span>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'ai' && <AiSettings />}

          {activeSection === 'notifications' && (
            <Card padding="md">
              <CardHeader title={t('settings.notifications')} subtitle="Manage how you receive alerts" />

              {notifSupported && (
                <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    {permission === 'granted'
                      ? <BellRing size={15} className="text-emerald-600" aria-hidden="true" />
                      : <BellOff  size={15} className="text-amber-500"   aria-hidden="true" />
                    }
                    <span className="text-ink-secondary">
                      Push status: <span className="font-medium text-ink-primary">{permissionLabel[permission] ?? permission}</span>
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {permission !== 'granted' && (
                      <Button variant="secondary" size="sm" onClick={requestPermission}>
                        {t('settings.notifRequest')}
                      </Button>
                    )}
                    {permission === 'granted' && (
                      <Button variant="ghost" size="sm" onClick={handleTestNotification}>
                        {t('settings.notifTest')}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <Toggle label={t('settings.emailNotif')} checked={notificationsEmail} onChange={setNotificationsEmail} />
              <Toggle label={t('settings.pushNotif')}  checked={notificationsPush}  onChange={setNotificationsPush}  />
              <Toggle label={t('settings.digest')}     checked={notificationsDigest} onChange={setNotificationsDigest} />
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card padding="md">
              <CardHeader title={t('settings.appearance')} subtitle="Customise the visual style of your workspace" />
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-ink-primary mb-2">{t('settings.colourTheme')}</p>
                  <div className="flex gap-2" role="radiogroup" aria-label={t('settings.colourTheme')}>
                    {[
                      t('settings.colourTheme.default'),
                      t('settings.colourTheme.slate'),
                      t('settings.colourTheme.forest'),
                    ].map((theme, i) => (
                      <button
                        key={theme}
                        role="radio"
                        aria-checked={i === 0}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          i === 0 ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-border text-ink-secondary hover:border-gray-300'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-ink-muted">{t('settings.darkMode.note')}</p>
                <div className="pt-2 border-t border-border/60">
                  <Toggle
                    label={t('settings.rtl')}
                    hint={t('settings.rtl.hint')}
                    checked={isRTL}
                    onChange={setIsRTL}
                  />
                </div>
              </div>
            </Card>
          )}

          {(activeSection === 'team' || activeSection === 'security') && (
            <Card padding="md">
              <CardHeader title={SECTIONS.find((s) => s.id === activeSection)?.label ?? ''} />
              <div className="py-8 text-center">
                <p className="text-sm text-ink-muted">{t('settings.futureRelease')}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
