/* Preenche a estrutura original das páginas com os registros do navegador. */
(async function () {
    'use strict';
    try { await LocalTI.ready; }
    catch (error) { LocalTI.showError(error.message); return; }
    const access = LocalTI.session;
    if (access?.setor === 'MARKETING') {
        document.querySelectorAll('[data-ti-only]').forEach(element => element.remove());
        document.querySelectorAll('.brand small, .side h3, .sub').forEach(element => {
            element.textContent = element.textContent
                .replace(/TECNOLOGIA DA INFORMAÇÃO/g, 'MARKETING')
                .replace(/DE TI/g, 'DE MARKETING').replace(/de TI/g, 'de Marketing');
        });
    }
    const byId = id => document.getElementById(id);
    let equipamentos = LocalTI.list();
    let historicos = LocalTI.history();

    const equipmentData = byId('dadosEquipamentos');
    if (equipmentData) {
        for (const item of equipamentos) {
            const element = document.createElement('div');
            element.className = 'equipamento-dado';
            for (const [key, value] of Object.entries(item)) element.setAttribute('data-' + key.toLowerCase(), String(value ?? ''));
            equipmentData.appendChild(element);
        }
    }

    const historyData = byId('dadosHistoricos');
    if (historyData) {
        for (const item of historicos) {
            const element = document.createElement('div');
            element.className = 'historico-dado';
            for (const [key, value] of Object.entries(item)) element.setAttribute('data-' + key.toLowerCase(), String(value ?? ''));
            element.dataset.histid = item.id;
            element.dataset.id = item.equipamentoId;
            historyData.appendChild(element);
        }
    }

    const table = byId('tabelaEquipamentos');
    if (table) {
        for (const item of equipamentos) {
            const row = document.createElement('tr');
            row.dataset.tipo = item.categoria;
            row.dataset.status = item.status;
            for (const value of [item.patrimonio, item.tipo, `${item.marca || ''} / ${item.modelo || ''}`, item.serial, item.responsavel, item.setor, item.local]) {
                const cell = document.createElement('td');
                cell.textContent = value || '';
                row.appendChild(cell);
            }
            const statusCell = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = 'tag ' + ({ 'Em uso': 'use', 'Em estoque': 'stock', 'Em manutenção': 'maint', 'Baixa': 'low' }[item.status] || '');
            badge.textContent = item.status;
            statusCell.appendChild(badge);
            row.appendChild(statusCell);
            const term = document.createElement('td');
            term.textContent = item.termo;
            row.appendChild(term);
            const actions = document.createElement('td');
            const details = document.createElement('button');
            details.type = 'button'; details.className = 'action-menu'; details.title = 'Ver informações'; details.textContent = '👀';
            details.addEventListener('click', () => verInformacoes(item.id));
            const menu = document.createElement('button');
            menu.type = 'button'; menu.className = 'action-menu'; menu.title = 'Ações'; menu.textContent = '⋮';
            menu.addEventListener('click', () => abrirAcoes(item.id));
            actions.append(details, document.createTextNode(' '), menu);
            row.appendChild(actions);
            table.appendChild(row);
        }
    }

    const hasSelection = byId('idEquipamento') || byId('equipamentoId');
    if (hasSelection) {
        const id = new URLSearchParams(window.location.search).get('id');
        const item = equipamentos.find(value => value.id === String(id));
        if (item) {
            const fields = Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toUpperCase(), value]));
            document.querySelectorAll('[data-local-value]').forEach(element => { element.value = fields[element.dataset.localValue] ?? ''; });
            document.querySelectorAll('[data-local-text]').forEach(element => { element.textContent = fields[element.dataset.localText] || ({ RESPONSAVEL: 'Sem responsável', SETOR: 'Sem setor', LOCAL: 'Sem local' }[element.dataset.localText] || ''); });
        } else {
            const form = byId('formEditar') || byId('formMovimentacao');
            if (form) form.hidden = true;
            document.querySelector('.equipamento-selecionado')?.remove();
            const message = document.createElement('section');
            message.className = 'panel';
            message.innerHTML = '<h2 class="section-title">Equipamento não encontrado</h2><p>Selecione um equipamento na lista para continuar.</p><button type="button" class="button">VOLTAR</button>';
            message.querySelector('button').onclick = () => { window.location.href = 'patrimonio.html'; };
            document.querySelector('main').appendChild(message);
        }
    }

    const profile = byId('modalPerfil');
    const userArea = document.querySelector('.top .user');
    if (userArea && !byId('sairSistema')) {
        const themeButton = document.createElement('button');
        themeButton.id = 'alternarTema';
        themeButton.type = 'button';
        themeButton.className = 'theme-toggle';
        themeButton.innerHTML = '<span class="theme-toggle-sun" aria-hidden="true">☀</span><span class="theme-toggle-moon" aria-hidden="true">☾</span><span class="theme-toggle-thumb" aria-hidden="true"></span>';
        function updateThemeButton() {
            const dark = document.documentElement.classList.contains('dark-mode');
            themeButton.setAttribute('aria-pressed', String(dark));
            themeButton.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
            themeButton.title = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
        }
        updateThemeButton();
        themeButton.addEventListener('click', () => {
            const dark = document.documentElement.classList.toggle('dark-mode');
            try { localStorage.setItem('gtm-theme', dark ? 'dark' : 'light'); } catch { }
            updateThemeButton();
        });
        userArea.appendChild(themeButton);
        const logout = document.createElement('button');
        logout.id = 'sairSistema';
        logout.type = 'button';
        logout.className = 'logout-button';
        logout.textContent = 'Sair';
        logout.addEventListener('click', async () => {
            const session = LocalTI.session;
            try { await fetch('/api/logout', { method: 'POST', headers: { 'X-GTM-Request': '1' } }); } catch { }
            localStorage.removeItem('gtm-session');
            window.location.replace('/login.html');
        });
        userArea.appendChild(logout);
    }
    byId('abrirPerfil')?.addEventListener('click', () => { profile.style.display = 'flex'; });
    byId('fecharPerfil')?.addEventListener('click', () => { profile.style.display = 'none'; });
    profile?.addEventListener('click', event => { if (event.target === profile) profile.style.display = 'none'; });
    document.querySelectorAll('.side .nav').forEach(element => {
        if (element.textContent.trim() === 'Movimentações') {
            element.classList.add('nav-static');
            element.removeAttribute('data-ui-click');
            element.removeAttribute('role');
            element.removeAttribute('tabindex');
            return;
        }
        element.setAttribute('role', 'link');
        element.tabIndex = 0;
        if (element.classList.contains('active')) element.setAttribute('aria-current', 'page');
        element.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                element.click();
            }
        });
    });

    // Os mesmos registros viram listas com rótulos no celular, sem perder colunas.
    document.querySelectorAll('main table').forEach(element => {
        element.classList.add('responsive-table');
        element.setAttribute('role', 'table');
        const headers = [...element.querySelectorAll('thead th')];
        const labels = headers.map(header => header.textContent.trim());
        headers.forEach(header => { header.scope = 'col'; header.setAttribute('role', 'columnheader'); });
        function labelRows() {
            element.querySelectorAll('tbody tr').forEach(row => {
                row.setAttribute('role', 'row');
                row.classList.toggle('table-empty', row.cells.length === 1 && row.cells[0].colSpan > 1);
                [...row.cells].forEach((cell, index) => {
                    cell.setAttribute('role', 'cell');
                    cell.dataset.label = labels[index] || '';
                    cell.classList.toggle('table-actions', Boolean(cell.querySelector('button')));
                    cell.querySelectorAll('button[title]').forEach(button => button.setAttribute('aria-label', button.title));
                });
            });
        }
        labelRows();
        element.querySelectorAll('tbody').forEach(body => {
            body.setAttribute('role', 'rowgroup');
            new MutationObserver(labelRows).observe(body, { childList: true, subtree: true });
        });
    });

    // Impede que a tela de fundo role enquanto um modal está aberto no celular.
    const mobile = window.matchMedia('(max-width: 900px)');
    function syncModalScroll() {
        const open = mobile.matches && [...document.querySelectorAll('.modal-overlay, .modal-sucesso, #modalPerfil, #modalErro')]
            .some(element => getComputedStyle(element).display !== 'none');
        document.documentElement.classList.toggle('modal-mobile-aberto', open);
    }
    document.querySelectorAll('.modal-overlay, .modal-sucesso, #modalPerfil, #modalErro').forEach(element => {
        new MutationObserver(syncModalScroll).observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
    });
    mobile.addEventListener('change', syncModalScroll);
    new MutationObserver(syncModalScroll).observe(document.body, { childList: true });
    syncModalScroll();

    {
        equipamentos = LocalTI.list();
        historicos = LocalTI.history();
        const view = document.createElement('script');
        const page = location.pathname.split('/').pop().replace('.html', '');
        view.src = 'js/' + ({ marketing: 'visaogeral', index: 'visaogeral', visaogeral: 'visaogeral', patrimonio: 'patrimonio', cadastrar: 'cadastrar', editar: 'editar', movimentacoes: 'movimentacoes' }[page] || 'visaogeral') + '.js';
        view.dataset.backendLoaded = 'true';
        view.onload = () => document.dispatchEvent(new Event('DOMContentLoaded'));
        document.body.appendChild(view);
    }
})();
