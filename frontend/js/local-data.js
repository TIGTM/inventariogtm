/* Acesso ao backend Python/PostgreSQL. Mantém a interface LocalTI usada pelas telas. */
(function () {
    'use strict';
    try {
        document.documentElement.classList.toggle('dark-mode', localStorage.getItem('gtm-theme') === 'dark');
    } catch { }
    let session = null;
    let API = "/api";
    localStorage.removeItem("gtm-session");
    const text = value => String(value ?? '').trim();
    const status = value => ({
        'EM USO': 'Em uso', 'EM ESTOQUE': 'Em estoque',
        'MANUTENÇÃO': 'Em manutenção', 'MANUTENCAO': 'Em manutenção',
        'BAIXA': 'Baixa', 'BAIXADO': 'Baixa', 'BAIXADA': 'Baixa'
    }[text(value).toUpperCase()] || text(value));
    const equipment = raw => ({ ...raw, id: text(raw.id), status: status(raw.status || 'Em estoque'),
        categoria: raw.categoria === 'Equipamento comum' ? 'Comum' : text(raw.categoria),
        serial: text(raw.serial ?? raw.numeroSerie), memoriaRam: text(raw.memoriaRam ?? raw.memoria),
        nomeNaRede: text(raw.nomeNaRede ?? raw.nomeRede), dataCompra: text(raw.dataCompra ?? raw.compra),
        notaFiscal: text(raw.notaFiscal ?? raw.nf), termo: text(raw.termo || 'N/A') });
    const historyRecord = raw => ({ ...raw, id: text(raw.histid ?? raw.id), histid: text(raw.histid ?? raw.id),
        equipamentoId: text(raw.equipamentoId ?? raw.idEquipamento), datahora: text(raw.datahora ?? raw.data),
        tipoEvento: text(raw.tipoEvento || 'Movimentação'), statusAnterior: status(raw.statusAnterior), statusNovo: status(raw.statusNovo),
        responsavelNovo: text(raw.responsavelNovo ?? raw.responsavel), setorNovo: text(raw.setorNovo ?? raw.setor),
        localNovo: text(raw.localNovo ?? raw.local), observacao: text(raw.observacao ?? raw.observacoes) });

    async function request(path, options = {}) {
        let response;
        try {
            response = await fetch(API + path, {
                ...options,
                headers: { 'Content-Type': 'application/json', 'X-GTM-Request': '1', ...(options.headers || {}) }
            });
        } catch {
            throw new Error('Não foi possível conectar ao servidor. Verifique se o Docker está iniciado.');
        }
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) {
            localStorage.removeItem('gtm-session');
            window.location.replace('/login.html');
        }
        if (!response.ok) throw new Error(body.detail || 'O servidor não conseguiu concluir a operação.');
        return body;
    }

    function showError(message) {
        let modal = document.getElementById('modalErro');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'mensagemLocal';
            modal.className = 'modal-overlay';
            modal.innerHTML = '<div class="confirmar-modal" role="dialog" aria-modal="true" aria-labelledby="tituloMensagemLocal"><div class="confirmar-conteudo"><h2 id="tituloMensagemLocal">Aviso</h2><p id="mensagemErro"></p></div><div class="confirmar-acoes"><button type="button" class="btn-fechar-modal">OK</button></div></div>';
            modal.querySelector('button').addEventListener('click', () => modal.remove());
            document.body.appendChild(modal);
        }
        modal.querySelector('#mensagemErro').textContent = message;
        modal.style.display = 'flex';
        modal.querySelector('button')?.focus();
    }

    window.LocalTI = {
        ready: (async () => {
            session = await request('/session');
            window.LocalTI.session = session;
            API = session.setor === 'MARKETING' ? '/api/marketing' : '/api';
            if (!session?.setor) { window.location.replace('/login.html'); throw new Error('Entre para acessar o sistema.'); }
            if (!['TI', 'MARKETING'].includes(session.setor)) { window.location.replace('/login.html'); throw new Error('Acesso inválido.'); }
            try {
                const old = localStorage.getItem('gtm-patrimonio-v1');
                if (old && session.setor === 'TI') {
                    const backup = JSON.parse(old);
                    const result = await request('/import-local', { method: 'POST', body: JSON.stringify(backup) });
                    if (result.importado) localStorage.removeItem('gtm-patrimonio-v1');
                }
            } catch (error) {
                if (error instanceof SyntaxError) throw new Error('Os dados antigos do navegador não puderam ser lidos.');
                throw error;
            }
            const [equipamentos, movimentacoes] = await Promise.all([request('/equipamentos'), request('/movimentacoes')]);
            window.LocalTI.equipamentos = equipamentos.map(equipment);
            window.LocalTI.movimentacoes = movimentacoes.map(historyRecord);
            return window.LocalTI;
        })(),
        equipamentos: [],
        movimentacoes: [],
        list: () => window.LocalTI.equipamentos,
        history: () => window.LocalTI.movimentacoes,
        get: id => window.LocalTI.equipamentos.find(item => String(item.id) === String(id)),
        create: input => request('/equipamentos', { method: 'POST', body: JSON.stringify(input) }),
        update: input => request('/equipamentos/' + encodeURIComponent(input.id), { method: 'PUT', body: JSON.stringify(input) }),
        move: input => request('/movimentacoes', { method: 'POST', body: JSON.stringify(input) }),
        remove: id => request('/equipamentos/' + encodeURIComponent(id), { method: 'DELETE' }),
        removeHistory: id => request('/movimentacoes/' + encodeURIComponent(id), { method: 'DELETE' }),
        showError, status,
        escapeHTML: value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
    };
})();
