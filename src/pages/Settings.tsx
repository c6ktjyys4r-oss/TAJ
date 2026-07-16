import React, { useState } from 'react';
import { Sparkles, Bell, Globe, Shield, Users, Palette, BellRing, BellOff } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../hooks/useNotifications';

const SECTIONS = [
  { id: 'general',      label: 'General',          icon: Globe },
  { id: 'ai',           label: 'AI & Automation',   icon: Sparkles },
  { id: 'notifications',label: 'Notifications',    icon: Bell },
  { id: 'appearance',   label: 'Appearance',       icon: Palette },
  { id: 'team',         label: 'Team',             icon: Users },
  { id: 'security',     label: 'Security',         icon: Shield },
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

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const {
    aiCompanionEnabled, setAiCompanionEnabled,
    notificationsEmail, setNotificationsEmail,
    notificationsPush,  setNotificationsPush,
    notificationsDigest, setNotificationsDigest,
  } = useSettings();
  const { supported: notifSupported, permission, requestPermission, notify } = useNotifications();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestNotification = () => {
    notify('TAJ Finance', { body: 'Test notification — everything is working correctly.' });
  };

  const permissionLabel: Record<string, string> = {
    granted: 'Enabled',
    denied:  'Blocked by browser',
    default: 'Not yet requested',
  };

  return (
    <div className="space-y-6">
      <PageTitle>Settings</PageTitle>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-48 shrink-0" aria-label="Settings sections">
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
        <div className="flex-1 space-y-4">
          {activeSection === 'general' && (
            <Card padding="md">
              <CardHeader title="General Settings" subtitle="Manage your workspace preferences" />
              <div className="space-y-4">
                <Input label="Organisation Name" defaultValue="TAJ Finance" />
                <Input label="Fiscal Year Start" type="month" defaultValue="2024-01" />
                <Input label="Default Currency" defaultValue="SAR (Saudi Riyal)" />
                <div className="pt-2">
                  <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Changes'}</Button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'ai' && (
            <Card padding="md">
              <CardHeader title="AI & Automation" subtitle="Configure AI features and automation rules" />
              <div>
                <Toggle
                  label="AI Companion"
                  hint="Show the floating AI chat assistant across all pages"
                  checked={aiCompanionEnabled}
                  onChange={setAiCompanionEnabled}
                />
                <Toggle label="Auto-classify documents" hint="Let AI classify uploaded documents automatically" checked onChange={() => {}} />
                <Toggle label="Smart bank matching"      hint="Use AI to suggest transaction matches"           checked onChange={() => {}} />
                <Toggle label="Anomaly alerts"           hint="Get notified about unusual financial patterns"   checked={false} onChange={() => {}} />
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card padding="md">
              <CardHeader title="Notifications" subtitle="Choose when and how you are notified" />
              <div>
                <Toggle label="Email notifications" hint="Receive updates via email"    checked={notificationsEmail}  onChange={setNotificationsEmail} />
                <Toggle label="Daily digest"        hint="Summary email every morning"  checked={notificationsDigest} onChange={setNotificationsDigest} />

                {/* Push notification permission */}
                {notifSupported && (
                  <div className="py-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-primary">Browser push notifications</p>
                        <p className="text-xs text-ink-muted mt-0.5">Receive alerts when documents are classified or reports are ready</p>
                      </div>
                      <Badge
                        variant={permission === 'granted' ? 'success' : permission === 'denied' ? 'danger' : 'default'}
                        dot
                      >
                        {permissionLabel[permission]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {permission === 'default' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<BellRing size={13} />}
                          onClick={requestPermission}
                        >
                          Enable push notifications
                        </Button>
                      )}
                      {permission === 'granted' && (
                        <>
                          <Toggle
                            label="Push notifications"
                            checked={notificationsPush}
                            onChange={setNotificationsPush}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<BellRing size={13} />}
                            onClick={handleTestNotification}
                          >
                            Send test
                          </Button>
                        </>
                      )}
                      {permission === 'denied' && (
                        <p className="text-xs text-ink-muted flex items-center gap-1">
                          <BellOff size={12} aria-hidden="true" />
                          Notifications are blocked. Enable them in your browser settings.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card padding="md">
              <CardHeader title="Appearance" subtitle="Customise the visual style of your workspace" />
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-ink-primary mb-2">Colour Theme</p>
                  <div className="flex gap-2" role="radiogroup" aria-label="Colour theme">
                    {['Gold & White (Default)', 'Slate Blue', 'Forest'].map((t, i) => (
                      <button
                        key={t}
                        role="radio"
                        aria-checked={i === 0}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          i === 0 ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-border text-ink-secondary hover:border-gray-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-ink-muted">Dark mode is not available in this version.</p>
              </div>
            </Card>
          )}

          {(activeSection === 'team' || activeSection === 'security') && (
            <Card padding="md">
              <CardHeader title={SECTIONS.find((s) => s.id === activeSection)?.label ?? ''} />
              <div className="py-8 text-center">
                <p className="text-sm text-ink-muted">This section is available in a future release.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
