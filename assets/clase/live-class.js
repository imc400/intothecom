(() => {
  const form = document.getElementById('registration-form');
  const button = document.getElementById('submit-button');
  const error = document.getElementById('form-error');
  const startsAt = Date.parse('2026-10-04T21:00:00.000Z');
  const params = new URLSearchParams(location.search);
  if (Date.now() >= startsAt) {
    button.querySelector('span').textContent = 'Inscripciones cerradas';
    error.textContent = 'La inscripción para la clase del 4 de octubre ya cerró.';
    error.hidden = false;
    return;
  }
  button.disabled = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    button.disabled = true;
    button.querySelector('span').textContent = 'Guardando tu inscripción…';
    error.hidden = true;
    form.setAttribute('aria-busy', 'true');
    const data = new FormData(form);
    try {
      const response = await fetch('/api/class-registration', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'), email: data.get('email'), website: data.get('website'),
          consent: data.get('consent') === 'on',
          utm_source: params.get('utm_source'), utm_medium: params.get('utm_medium'), utm_campaign: params.get('utm_campaign'),
        }), signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'No pudimos guardar tu inscripción. Intenta nuevamente.');
      document.getElementById('registration-content').hidden = true;
      const success = document.getElementById('registration-success');
      success.hidden = false;
      success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    } catch (failure) {
      error.textContent = failure.name === 'TimeoutError' || failure instanceof TypeError || failure instanceof SyntaxError
        ? 'No pudimos confirmar la inscripción. Revisa tu conexión e intenta otra vez; no se duplicará tu registro.'
        : failure.message;
      error.hidden = false;
      button.disabled = false;
      button.querySelector('span').textContent = 'Quiero asistir gratis';
    } finally { form.removeAttribute('aria-busy'); }
  });
})();
