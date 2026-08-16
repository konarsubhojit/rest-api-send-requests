interface ProxyToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ProxyToggle({ enabled, onChange }: ProxyToggleProps) {
  return (
    <div className="alert alert-warning py-2" role="note">
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="use-cors-proxy"
          checked={enabled}
          onChange={event => onChange(event.target.checked)}
        />
        <label className="form-check-label fw-semibold" htmlFor="use-cors-proxy">
          Use CORS proxy
        </label>
      </div>
      <small>
        Opt in only when needed. Requests and credentials transit the configured third-party proxy.
      </small>
    </div>
  );
}
