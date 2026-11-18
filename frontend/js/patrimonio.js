
const campoBusca = document.getElementById("campoBusca");
const filtroTipo = document.getElementById("filtroTipo");
const filtroStatus = document.getElementById("filtroStatus");
const tabelaEquipamentos = document.getElementById("tabelaEquipamentos");

const modalInformacoes = document.getElementById("modalInformacoes");
const modalInformacoesConteudo = document.getElementById("modalInformacoesConteudo");
const modalHistorico = document.getElementById("modalHistorico");
const modalHistoricoConteudo = document.getElementById("modalHistoricoConteudo");

const dadosEquipamentos = document.querySelectorAll("#dadosEquipamentos .equipamento-dado");
const dadosHistoricos = document.querySelectorAll("#dadosHistoricos .historico-dado");

let equipamentoParaExcluir = null;
let equipamentoSelecionadoAcoes = null;
let historicoSelecionadoExcluir = null;

/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizarTexto(valor) {
    return String(valor ?? "").trim().toUpperCase();
}

function normalizarStatus(valor) {
    const status = normalizarTexto(valor);

    if (
        status === "MANUTENÇÃO" ||
        status === "MANUTENCAO" ||
        status === "EM MANUTENÇÃO" ||
        status === "EM MANUTENCAO"
    ) {
        return "EM MANUTENÇÃO";
    }

    if (status === "EM USO") {
        return "EM USO";
    }

    if (status === "EM ESTOQUE") {
        return "EM ESTOQUE";
    }

    if (
        status === "BAIXA" ||
        status === "BAIXADO" ||
        status === "BAIXADA"
    ) {
        return "Baixa";
    }

    return status;
}

function statusParaExibicao(valor) {
    const status = normalizarStatus(valor);

    if (status === "EM USO") {
        return "Em uso";
    }

    if (status === "EM ESTOQUE") {
        return "Em estoque";
    }

    if (status === "EM MANUTENÇÃO") {
        return "Em manutenção";
    }

    if (status === "Baixa") {
        return "Baixa";
    }

    return String(valor ?? "").trim() || "-";
}

/* =========================================================
   EQUIPAMENTOS E EXCLUSÃO
========================================================= */

function excluirEquipamentoSelecionado() {
    if (!equipamentoSelecionadoAcoes) {
        alert("Nenhum equipamento selecionado.");
        return;
    }

    equipamentoParaExcluir = equipamentoSelecionadoAcoes;

    fecharModalAcoes();

    const modal = document.getElementById("confirmarExcluirEquipamento");

    if (modal) {
        modal.classList.add("aberto");
    }
}

function fecharConfirmacaoExcluirEquipamento() {
    equipamentoParaExcluir = null;

    const modal = document.getElementById("confirmarExcluirEquipamento");

    if (modal) {
        modal.classList.remove("aberto");
    }
}

async function confirmarExclusaoEquipamento() {
    if (!equipamentoParaExcluir) return;
    try {
        await LocalTI.remove(equipamentoParaExcluir.id);
        window.location.href = "patrimonio.html";
    } catch (erro) {
        LocalTI.showError(erro.message);
    }
}

function obterEquipamentos() {
    const lista = [];

    dadosEquipamentos.forEach(elemento => {
        const dados = elemento.dataset;

        lista.push({
            id: String(dados.id || "").trim(),
            patrimonio: dados.patrimonio || "",
            categoria: dados.categoria || "",
            tipo: dados.tipo || "",
            marca: dados.marca || "",
            modelo: dados.modelo || "",
            serial: dados.serial || "",
            local: dados.local || "",
            setor: dados.setor || "",
            status: statusParaExibicao(dados.status),
            responsavel: dados.responsavel || "",
            email: dados.email || "",
            telefone: dados.telefone || "",
            termo: dados.termo || "",
            processador: dados.processador || "",
            memoriaRam: dados.memoriaram || "",
            armazenamento: dados.armazenamento || "",
            sistemaOperacional: dados.sistemaoperacional || "",
            etiquetaFabricante: dados.etiquetafabricante || "",
            nomeNaRede: dados.nomenarede || "",
            imei1: dados.imei1 || "",
            imei2: dados.imei2 || "",
            capacidade: dados.capacidade || "",
            cor: dados.cor || "",
            numero: dados.numero || "",
            operadora: dados.operadora || "",
            condicao: dados.condicao || "",
            observacoes: dados.observacoes || "",
            dataCompra: dados.datacompra || "",
            fornecedor: dados.fornecedor || "",
            notaFiscal: dados.notafiscal || "",
            valor: dados.valor || "",
            garantia: dados.garantia || ""
        });
    });

    return lista;
}

const equipamentos = obterEquipamentos();

function encontrarEquipamento(id) {
    const idProcurado = String(id ?? "").trim();

    return equipamentos.find(equipamento =>
        String(equipamento.id).trim() === idProcurado
    );
}

/* =========================================================
   FILTROS
========================================================= */

function aplicarFiltros() {
    const busca = normalizarTexto(campoBusca ? campoBusca.value : "");

    const tipoSelecionado = normalizarTexto(
        filtroTipo ? filtroTipo.value : ""
    );

    const statusSelecionado = normalizarStatus(
        filtroStatus ? filtroStatus.value : ""
    );

    if (!tabelaEquipamentos) {
        return;
    }

    const linhas = tabelaEquipamentos.querySelectorAll("tr");

    linhas.forEach(linha => {
        const texto = normalizarTexto(linha.textContent);
        const tipo = normalizarTexto(linha.dataset.tipo);
        const status = normalizarStatus(linha.dataset.status);

        const correspondeBusca =
            !busca || texto.includes(busca);

        const correspondeTipo =
            !tipoSelecionado || tipo === tipoSelecionado;

        const correspondeStatus =
            !statusSelecionado || status === statusSelecionado;

        linha.style.display =
            correspondeBusca && correspondeTipo && correspondeStatus
                ? ""
                : "none";
    });
}

if (campoBusca) {
    campoBusca.addEventListener("input", aplicarFiltros);
}

if (filtroTipo) {
    filtroTipo.addEventListener("change", aplicarFiltros);
}

if (filtroStatus) {
    filtroStatus.addEventListener("change", aplicarFiltros);
}

/* =========================================================
   HTML SEGURO E COMPONENTES DE INFORMAÇÃO
========================================================= */

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function campoInformacao(titulo, valor) {
    return `
        <div class="info-item">
            <span class="info-label">
                ${escaparHTML(titulo)}
            </span>

            <strong class="info-value">
                ${escaparHTML(valor || "-")}
            </strong>
        </div>
    `;
}

function tituloSecao(titulo) {
    return `
        <div class="info-section-title">
            ${escaparHTML(titulo)}
        </div>
    `;
}

/* =========================================================
   MODAL DE INFORMAÇÕES
========================================================= */

function verInformacoes(id) {
    const equipamento = encontrarEquipamento(id);

    if (!equipamento) {
        alert("Equipamento não encontrado.");
        return;
    }

    let html = "";

    html += tituloSecao("Dados gerais");

    html += `
        <div class="info-grid">
            ${campoInformacao("Patrimônio", equipamento.patrimonio)}
            ${campoInformacao("Categoria", equipamento.categoria)}
            ${campoInformacao("Tipo", equipamento.tipo)}
            ${campoInformacao("Marca", equipamento.marca)}
            ${campoInformacao("Modelo", equipamento.modelo)}
            ${campoInformacao("Número de série", equipamento.serial)}
            ${campoInformacao("Local", equipamento.local)}
            ${campoInformacao("Setor", equipamento.setor)}
            ${campoInformacao("Status", equipamento.status)}
        </div>
    `;

    html += tituloSecao("Responsável");

    html += `
        <div class="info-grid">
            ${campoInformacao("Responsável", equipamento.responsavel)}
            ${campoInformacao("E-mail", equipamento.email)}
            ${campoInformacao("Telefone", equipamento.telefone)}
            ${campoInformacao("Local", equipamento.local)}
            ${campoInformacao("Termo", equipamento.termo)}
        </div>
    `;

    const categoria = normalizarTexto(equipamento.categoria);

    if (
        categoria.includes("NOTEBOOK") ||
        categoria.includes("DESKTOP")
    ) {
        html += tituloSecao("Informações do computador");

        html += `
            <div class="info-grid">
                ${campoInformacao("Processador", equipamento.processador)}
                ${campoInformacao("Memória RAM", equipamento.memoriaRam)}
                ${campoInformacao("Armazenamento", equipamento.armazenamento)}
                ${campoInformacao("Sistema operacional", equipamento.sistemaOperacional)}
                ${campoInformacao("Etiqueta do fabricante", equipamento.etiquetaFabricante)}
                ${campoInformacao("Nome na rede", equipamento.nomeNaRede)}
            </div>
        `;
    }

    if (
        categoria.includes("CELULAR") ||
        categoria.includes("TABLET")
    ) {
        html += tituloSecao("Informações do celular");

        html += `
            <div class="info-grid">
                ${campoInformacao("IMEI 1", equipamento.imei1)}
                ${campoInformacao("IMEI 2", equipamento.imei2)}
                ${campoInformacao("Capacidade", equipamento.capacidade)}
                ${campoInformacao("Cor", equipamento.cor)}
                ${campoInformacao("Número", equipamento.numero)}
                ${campoInformacao("Operadora", equipamento.operadora)}
            </div>
        `;
    }

    if (categoria === "COMUM") {
        html += tituloSecao("Informações do equipamento");

        html += `
            <div class="info-grid">
                ${campoInformacao("Condição", equipamento.condicao)}
            </div>

            <div class="info-observacoes">
                <span class="info-label">Observações</span>

                <div class="info-observacoes-texto">
                    ${escaparHTML(equipamento.observacoes || "-")}
                </div>
            </div>
        `;
    }

    if (LocalTI.session?.setor !== "MARKETING") {
        html += tituloSecao("Aquisição");

        html += `
        <div class="info-grid">
            ${campoInformacao("Data da compra", equipamento.dataCompra)}
            ${campoInformacao("Fornecedor", equipamento.fornecedor)}
            ${campoInformacao("Nota fiscal", equipamento.notaFiscal)}
            ${campoInformacao("Valor", equipamento.valor)}
            ${campoInformacao("Garantia", equipamento.garantia)}
        </div>
        `;
    }

    if (modalInformacoesConteudo) {
        modalInformacoesConteudo.innerHTML = html;
    }

    if (modalInformacoes) {
        modalInformacoes.classList.add("aberto");
    }
}

function fecharModalInformacoes() {
    if (modalInformacoes) {
        modalInformacoes.classList.remove("aberto");
    }
}

/* =========================================================
   MODAL DE AÇÕES
========================================================= */

function abrirAcoes(id) {
    const equipamento = encontrarEquipamento(id);

    if (!equipamento) {
        alert("Equipamento não encontrado.");
        return;
    }

    equipamentoSelecionadoAcoes = equipamento;

    const modal = document.getElementById("modalAcoes");

    if (modal) {
        modal.classList.add("aberto");
    }
}

function fecharModalAcoes() {
    const modal = document.getElementById("modalAcoes");

    if (modal) {
        modal.classList.remove("aberto");
    }

    equipamentoSelecionadoAcoes = null;
}

function movimentarEquipamentoSelecionado() {
    if (!equipamentoSelecionadoAcoes) {
        alert("Nenhum equipamento selecionado.");
        return;
    }

    const id = equipamentoSelecionadoAcoes.id;
    const base = window.BASE_FOLDER || "";

    fecharModalAcoes();

    window.location.href =
        base + "movimentacoes.html?id=" + encodeURIComponent(id);
}

function editarEquipamentoSelecionado() {
    if (!equipamentoSelecionadoAcoes) {
        alert("Nenhum equipamento selecionado.");
        return;
    }

    const id = equipamentoSelecionadoAcoes.id;
    const base = window.BASE_FOLDER || "";

    fecharModalAcoes();

    window.location.href =
        base + "editar.html?id=" + encodeURIComponent(id);
}

/* =========================================================
   HISTÓRICO
========================================================= */

function obterHistoricosEquipamento(id) {
    const historicos = [];
    const idEquipamento = String(id ?? "").trim();

    dadosHistoricos.forEach(elemento => {
        const dados = elemento.dataset;
        const idHistorico = String(dados.id || "").trim();

        if (idHistorico !== idEquipamento) {
            return;
        }

        historicos.push({
            histid: String(dados.histid || "").trim(),
            id: idHistorico,
            datahora: dados.datahora || "",
            tipoEvento: dados.tipoevento || "",
            observacao: dados.observacao || "",
            motivo: dados.motivo || "",
            statusAnterior: dados.statusanterior || "",
            statusNovo: dados.statusnovo || "",
            responsavelAnterior: dados.responsavelanterior || "",
            responsavelNovo: dados.responsavelnovo || "",
            setorAnterior: dados.setoranterior || "",
            setorNovo: dados.setornovo || "",
            termoAnterior: dados.termoanterior || "",
            termoNovo: dados.termonovo || ""
        });
    });

    historicos.sort((a, b) => {
        const dataA = Date.parse(a.datahora) || 0;
        const dataB = Date.parse(b.datahora) || 0;
        return dataB - dataA || Number(b.histid || 0) - Number(a.histid || 0);
    });

    return historicos;
}

function formatarDataHora(valor) {
    if (!valor) {
        return "-";
    }

    let texto = String(valor).trim().replace("T", " ");

    if (texto.includes(".")) {
        texto = texto.split(".")[0];
    }

    const partes = texto.split(" ");

    if (partes.length >= 2) {
        const data = partes[0];
        const hora = partes[1];
        const partesData = data.split("-");

        if (partesData.length === 3) {
            return (
                partesData[2] + "/" +
                partesData[1] + "/" +
                partesData[0] + " " +
                hora.substring(0, 8)
            );
        }
    }

    const dataObj = new Date(valor);

    if (!isNaN(dataObj.getTime())) {
        const dia = String(dataObj.getDate()).padStart(2, "0");
        const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
        const ano = dataObj.getFullYear();
        const hora = String(dataObj.getHours()).padStart(2, "0");
        const minuto = String(dataObj.getMinutes()).padStart(2, "0");
        const segundo = String(dataObj.getSeconds()).padStart(2, "0");

        return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
    }

    return texto;
}

function nomeEvento(tipo) {
    const evento = normalizarTexto(tipo);

    if (evento === "CADASTRO") {
        return "Cadastro do ativo";
    }

    if (evento === "USO") {
        return "Transferência";
    }

    if (evento === "ESTOQUE") {
        return "Entrada em estoque";
    }

    if (evento === "MANUTENCAO" || evento === "MANUTENÇÃO") {
        return "Manutenção";
    }

    if (evento === "Baixa") {
        return "Baixa de equipamento";
    }

    return tipo || "Movimentação";
}

function valorHistorico(valor) {
    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {
        return "Sem informação";
    }

    return String(valor).trim();
}

function criarCampoHistorico(titulo, anterior, novo) {
    const valorAnterior = valorHistorico(anterior);
    const valorNovo = valorHistorico(novo);

    return `
        <div class="historico-campo">
            <span class="historico-label">
                ${escaparHTML(titulo)}
            </span>

            <div class="historico-valores">
                <span class="historico-valor historico-valor-anterior">
                    ${escaparHTML(valorAnterior)}
                </span>

                <span class="historico-seta">→</span>

                <span class="historico-valor historico-valor-novo">
                    ${escaparHTML(valorNovo)}
                </span>
            </div>
        </div>
    `;
}

function criarDetalhesHistorico(historico) {
    let html = "";

    html += criarCampoHistorico(
        "RESPONSÁVEL",
        historico.responsavelAnterior,
        historico.responsavelNovo
    );

    html += criarCampoHistorico(
        "SETOR",
        historico.setorAnterior,
        historico.setorNovo
    );

    html += criarCampoHistorico(
        "STATUS",
        historico.statusAnterior
            ? statusParaExibicao(historico.statusAnterior)
            : "Sem informação",
        historico.statusNovo
            ? statusParaExibicao(historico.statusNovo)
            : "Sem informação"
    );

    html += criarCampoHistorico(
        "TERMO",
        historico.termoAnterior,
        historico.termoNovo
    );

    if (historico.motivo) {
        html += `
            <div class="historico-campo">
                <span class="historico-label">MOTIVO</span>

                <div class="historico-motivo">
                    ${escaparHTML(historico.motivo)}
                </div>
            </div>
        `;
    }

    if (historico.observacao) {
        html += `
            <div class="historico-campo">
                <span class="historico-label">OBSERVAÇÃO</span>

                <div class="historico-motivo">
                    ${escaparHTML(historico.observacao)}
                </div>
            </div>
        `;
    }

    return html;
}

function abrirDetalhesHistorico(indice) {
    const detalhes = document.getElementById("historicoDetalhes_" + indice);
    const seta = document.getElementById("historicoSeta_" + indice);

    if (!detalhes) {
        return;
    }

    const aberto = detalhes.style.display !== "none";

    if (aberto) {
        detalhes.style.display = "none";

        if (seta) {
            seta.textContent = "⌄";
        }
    } else {
        detalhes.style.display = "grid";

        if (seta) {
            seta.textContent = "⌃";
        }
    }
}

function criarItemHistorico(historico, indice) {
    const evento = nomeEvento(historico.tipoEvento);
    const dataHora = formatarDataHora(historico.datahora);

    let resumoStatus = "";

    if (historico.statusAnterior || historico.statusNovo) {
        const statusAnterior = historico.statusAnterior
            ? statusParaExibicao(historico.statusAnterior)
            : "Sem informação";

        const statusNovo = historico.statusNovo
            ? statusParaExibicao(historico.statusNovo)
            : "Sem informação";

        resumoStatus = `
            <span class="historico-status">
                ${escaparHTML(statusAnterior)}
                →
                ${escaparHTML(statusNovo)}
            </span>
        `;
    }

    if (normalizarTexto(historico.tipoEvento) === "CADASTRO") {
        return `
            <div class="historico-item historico-item-cadastro">
                <div class="historico-cabecalho">
                    <div class="historico-resumo">
                        <strong>${escaparHTML(evento)}</strong>
                        ${resumoStatus}
                        <small>${escaparHTML(dataHora)}</small>
                    </div>
                </div>
            </div>
        `;
    }

    const detalhes = criarDetalhesHistorico(historico);
    const histid = String(historico.histid || "").trim();
    const histidSeguro = escaparHTML(histid);

    return `
        <div class="historico-item">
            <div
                class="historico-cabecalho"
                data-history-action="toggle" data-history-id="${indice}"
            >
                <div class="historico-resumo">
                    <strong>${escaparHTML(evento)}</strong>
                    ${resumoStatus}
                    <small>${escaparHTML(dataHora)}</small>
                </div>

                <div class="historico-acoes">
                    <div class="historico-menu-container">
                        <button
                            type="button"
                            class="historico-menu"
                            aria-label="Opções da movimentação"
                            data-history-action="menu" data-history-id="${histidSeguro}"
                        >
                            ⋮
                        </button>

                        <div
                            id="historicoMenu_${indice}"
                            class="historico-menu-opcoes"
                            style="display:none;"
                        >
                            <button
                                type="button"
                                data-history-action="delete" data-history-id="${histidSeguro}"
                            >
                                EXCLUIR
                            </button>
                        </div>
                    </div>

                    <span id="historicoSeta_${indice}">↓</span>
                </div>
            </div>

            <div
                id="historicoDetalhes_${indice}"
                class="historico-detalhes"
                style="display:none;"
            >
                ${detalhes}
            </div>
        </div>
    `;
}

/* =========================================================
   EXCLUSÃO DE MOVIMENTAÇÃO DO HISTÓRICO
========================================================= */

function abrirMenuHistorico(evento, histid) {
    evento.preventDefault();
    evento.stopPropagation();

    document.querySelectorAll(".historico-menu-opcoes").forEach(menu => {
        menu.style.display = "none";
    });

    historicoSelecionadoExcluir = String(histid || "").trim();

    if (!historicoSelecionadoExcluir) {
        alert("Movimentação não identificada.");
        return;
    }

    const container = evento.target.closest(
        ".historico-menu-container"
    );

    if (!container) {
        return;
    }

    const menu = container.querySelector(".historico-menu-opcoes");

    if (menu) {
        menu.style.display = "block";
    }
}

function abrirConfirmacaoExcluirHistorico(evento, histid) {
    if (evento) {
        evento.preventDefault();
        evento.stopPropagation();
    }

    historicoSelecionadoExcluir = String(histid || "").trim();

    if (!historicoSelecionadoExcluir) {
        alert("Movimentação não identificada.");
        return;
    }

    document.querySelectorAll(".historico-menu-opcoes").forEach(menu => {
        menu.style.display = "none";
    });

    const modalConfirmacao = document.getElementById(
        "confirmarExcluirHistorico"
    );

    if (modalConfirmacao) {
        modalConfirmacao.classList.add("aberto");
    }
}

function fecharModalExclusaoSucesso() {
    const modal = document.getElementById("modalExclusaoSucesso");

    if (modal) {
        modal.classList.remove("aberto");
    }
}

function fecharConfirmacaoExcluirHistorico() {
    historicoSelecionadoExcluir = null;

    document.querySelectorAll(".historico-menu-opcoes").forEach(menu => {
        menu.style.display = "none";
    });

    const modal = document.getElementById("confirmarExcluirHistorico");

    if (modal) {
        modal.classList.remove("aberto");
    }
}

async function confirmarExclusaoHistorico() {
    if (!historicoSelecionadoExcluir) return;
    try {
        await LocalTI.removeHistory(historicoSelecionadoExcluir);
        window.location.href = "patrimonio.html?exclusaoHistorico=sucesso";
    } catch (erro) {
        LocalTI.showError(erro.message);
    }
}

/* =========================================================
   ABRIR E FECHAR HISTÓRICO
========================================================= */

function acaoHistorico() {
    if (!equipamentoSelecionadoAcoes) {
        alert("Nenhum equipamento selecionado.");
        return;
    }

    const equipamento = equipamentoSelecionadoAcoes;
    const historicos = obterHistoricosEquipamento(equipamento.id);

    let html = "";

    if (historicos.length === 0) {
        html = `
            <div class="historico-vazio">
                Nenhum histórico encontrado para este equipamento.
            </div>
        `;
    } else {
        historicos.forEach((historico, indice) => {
            html += criarItemHistorico(historico, indice);
        });
    }

    if (modalHistoricoConteudo) {
        modalHistoricoConteudo.innerHTML = html;
    }

    fecharModalAcoes();

    if (modalHistorico) {
        modalHistorico.classList.add("aberto");
    }
}

function fecharModalHistorico() {
    if (modalHistorico) {
        modalHistorico.classList.remove("aberto");
    }

    document.querySelectorAll(".historico-menu-opcoes").forEach(menu => {
        menu.style.display = "none";
    });
}

/* =========================================================
   FECHAMENTO DE MODAIS
========================================================= */

function fecharModaisComEscape() {
    fecharModalInformacoes();
    fecharModalAcoes();
    fecharModalHistorico();
    fecharConfirmacaoExcluirEquipamento();
    fecharConfirmacaoExcluirHistorico();
}

if (modalInformacoes) {
    modalInformacoes.addEventListener("click", evento => {
        if (evento.target === modalInformacoes) {
            fecharModalInformacoes();
        }
    });
}

const modalAcoes = document.getElementById("modalAcoes");

if (modalAcoes) {
    modalAcoes.addEventListener("click", evento => {
        if (evento.target === modalAcoes) {
            fecharModalAcoes();
        }
    });
}

if (modalHistorico) {
    modalHistorico.addEventListener("click", evento => {
        if (evento.target === modalHistorico) {
            fecharModalHistorico();
        }
    });
}

const modalConfirmarExcluirEquipamento = document.getElementById(
    "confirmarExcluirEquipamento"
);

if (modalConfirmarExcluirEquipamento) {
    modalConfirmarExcluirEquipamento.addEventListener("click", evento => {
        if (evento.target === modalConfirmarExcluirEquipamento) {
            fecharConfirmacaoExcluirEquipamento();
        }
    });
}

const modalConfirmarExcluirHistorico = document.getElementById(
    "confirmarExcluirHistorico"
);

if (modalConfirmarExcluirHistorico) {
    modalConfirmarExcluirHistorico.addEventListener("click", evento => {
        if (evento.target === modalConfirmarExcluirHistorico) {
            fecharConfirmacaoExcluirHistorico();
        }
    });
}

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharModaisComEscape();
    }
});

/* =========================================================
   INICIALIZAÇÃO E MENSAGEM DE EXCLUSÃO
========================================================= */

aplicarFiltros();

document.addEventListener("DOMContentLoaded", function () {
    const parametros = new URLSearchParams(window.location.search);

    if (parametros.get("exclusaoHistorico") === "sucesso") {
        const modal = document.getElementById("modalExclusaoSucesso");

        if (modal) {
            modal.classList.add("aberto");
        }

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }
});
