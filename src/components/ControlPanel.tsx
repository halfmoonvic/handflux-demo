import type { VisualTheme } from '../state/visualModeStore';

type ControlPanelProps = {
  cameraVisible: boolean;
  theme: VisualTheme;
  onToggleCamera: () => void;
  onThemeChange: (theme: VisualTheme) => void;
};

const themes: { value: VisualTheme; label: string }[] = [
  { value: 'ion', label: 'Ion' },
  { value: 'aqua', label: 'Aqua' },
  { value: 'flare', label: 'Flare' },
];

export function ControlPanel({
  cameraVisible,
  theme,
  onToggleCamera,
  onThemeChange,
}: ControlPanelProps) {
  return (
    <section className="control-panel" aria-label="Visual controls">
      <div className="theme-tabs" role="tablist" aria-label="Energy color theme">
        {themes.map((item) => (
          <button
            key={item.value}
            className={item.value === theme ? 'theme-tab theme-tab--active' : 'theme-tab'}
            type="button"
            role="tab"
            aria-selected={item.value === theme}
            onClick={() => onThemeChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="camera-toggle">
        <input type="checkbox" checked={cameraVisible} onChange={onToggleCamera} />
        Camera
      </label>
    </section>
  );
}
