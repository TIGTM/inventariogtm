(() => {
  const form = document.getElementById('loginForm');
  const password = document.getElementById('senha');
  const error = document.getElementById('loginError');
  const submit = document.getElementById('loginSubmit');
  const sectorStep = document.getElementById('sectorStep');
  const title = document.getElementById('loginTitle');
  const description = document.getElementById('loginDescription');
  const back = document.getElementById('loginBack');
  let sector = null;
  let selectedButton = null;
  let busy = false;

  document.querySelectorAll('.login-sector').forEach(button => button.addEventListener('click', () => {
    sector = button.dataset.sector;
    selectedButton = button;
    title.textContent = sector === 'TI' ? 'Entrar no TI' : 'Entrar no Marketing';
    description.textContent = 'Informe a senha para acessar esta área.';
    sectorStep.hidden = true;
    form.hidden = false;
    password.value = '';
    password.removeAttribute('aria-invalid');
    error.hidden = true;
    password.focus();
  }));

  back.addEventListener('click', () => {
    if (busy) return;
    sector = null;
    password.value = '';
    password.removeAttribute('aria-invalid');
    error.hidden = true;
    form.hidden = true;
    sectorStep.hidden = false;
    title.textContent = 'Escolha seu departamento';
    description.textContent = 'Selecione uma área para continuar.';
    selectedButton?.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !sector) return;
    if (!password.value) {
      error.textContent = 'Digite a senha para continuar.';
      error.hidden = false;
      password.setAttribute('aria-invalid', 'true');
      password.focus();
      return;
    }
    busy = true;
    back.disabled = true;
    password.removeAttribute('aria-invalid');
    submit.disabled = true;
    submit.textContent = 'Entrando...';
    error.hidden = true;
    try {
      const response = await fetch('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-GTM-Request': '1' },
        body: JSON.stringify({ setor: sector, senha: password.value })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Não foi possível entrar.');
      localStorage.removeItem('gtm-session');
      window.location.replace('/visaogeral.html');
    } catch (reason) {
      error.textContent = reason.message || 'Não foi possível conectar ao servidor.';
      error.hidden = false;
      password.setAttribute('aria-invalid', 'true');
      password.focus();
    } finally {
      busy = false;
      back.disabled = false;
      submit.disabled = false;
      submit.textContent = 'Entrar';
    }
  });
})();
