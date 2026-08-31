const status = document.querySelector<HTMLElement>("[data-runtime-status]");
const tokenTarget = document.querySelector<HTMLElement>("[data-proof-token]");

async function loadRuntime(): Promise<void> {
  try {
    const response = await fetch("/api/runtime?mode=summary");
    const data = (await response.json()) as { status?: string };
    if (status) status.textContent = data.status ?? "unknown";
  } catch {
    if (status) status.textContent = "unavailable";
  }
}

async function loadSessionTelemetry(): Promise<void> {
  try {
    const response = await fetch("/api/session-info");
    const data = (await response.json()) as { token?: string };
    if (tokenTarget) tokenTarget.textContent = data.token ?? "missing";
  } catch {
    if (tokenTarget) tokenTarget.textContent = "unavailable";
  }
}

void Promise.all([loadRuntime(), loadSessionTelemetry()]);
