function valor(id) {
    const campo = document.getElementById(id);

    if (!campo) {
        return "";
    }

    return campo.value.trim();
}

function normalizarTexto(texto) {
    if (!texto) {
        return "";
    }

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

function ajustarData(id) {
    const campo = document.getElementById(id);

    if (!campo) {
        return;
    }

    if (!campo.value) {
        return;
    }

    const valorAtual = campo.value;

    if (valorAtual.length >= 10) {
        campo.value = valorAtual.substring(0, 10);
    }
}

function mostrarFormularioTipo() {
    const tipo = normalizarTexto(
        valor("categoria")
    );

    const computador =
        document.getElementById("formComputador");

    const celular =
        document.getElementById("formCelular");

    const comum =
        document.getElementById("formComum");

    if (computador) {
        computador.classList.remove("ativo");
    }

    if (celular) {
        celular.classList.remove("ativo");
    }

    if (comum) {
        comum.classList.remove("ativo");
    }

    if (
        tipo.includes("NOTEBOOK") ||
        tipo.includes("DESKTOP") ||
        tipo.includes("COMPUTADOR")
    ) {
        if (computador) {
            computador.classList.add("ativo");
        }

        return;
    }

    if (
        tipo.includes("CELULAR") ||
        tipo.includes("TABLET")
    ) {
        if (celular) {
            celular.classList.add("ativo");
        }

        return;
    }

    if (comum) {
        comum.classList.add("ativo");
    }
}

function montarDados() {
    return {
        id: valor("idEquipamento"),
        patrimonio: valor("patrimonio"),
        categoria: valor("categoria"),
        tipo: valor("tipo"),
        marca: valor("marca"),
        modelo: valor("modelo"),
        serial: valor("serial"),
        local: valor("local"),
        setor: valor("setor"),
        status: valor("status"),
        responsavel: valor("responsavel"),
        email: valor("email"),
        telefone: valor("telefone"),
        termo: valor("termo"),
        processador: valor("processador"),
        memoriaRam: valor("memoriaRam"),
        armazenamento: valor("armazenamento"),
        sistemaOperacional: valor("sistemaOperacional"),
        etiquetaFabricante: valor("etiquetaFabricante"),
        nomeNaRede: valor("nomeNaRede"),
        imei1: valor("imei1"),
        imei2: valor("imei2"),
        capacidade: valor("capacidade"),
        cor: valor("cor"),
        numero: valor("numero"),
        operadora: valor("operadora"),
        condicao: valor("condicao"),
        observacoes: valor("observacoes"),
        dataCompra: valor("dataCompra"),
        fornecedor: valor("fornecedor"),
        notaFiscal: valor("notaFiscal"),
        valor: valor("valor"),
        garantia: valor("garantia")
    };
}

function abrirModalErro(mensagem) {
    const modal =
        document.getElementById("modalErro");

    const mensagemErro =
        document.getElementById("mensagemErro");

    if (!modal || !mensagemErro) {
        alert(mensagem);
        return;
    }

    mensagemErro.innerText = mensagem;
    modal.style.display = "flex";
}

function fecharModalErro() {
    const modal =
        document.getElementById("modalErro");

    if (modal) {
        modal.style.display = "none";
    }
}

async function salvarEdicao() {
    try {
        await LocalTI.update(montarDados());
        document.getElementById("modalSucesso").classList.add("aberto");
    } catch (erro) {
        abrirModalErro(erro.message);
    }
}

function voltarPatrimonio() {
    window.location.href =
        (window.BASE_FOLDER || "") +
        "patrimonio.html";
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        ajustarData("dataCompra");
        ajustarData("garantia");
        mostrarFormularioTipo();

        const botaoErro =
            document.getElementById("okErro");

        if (botaoErro) {
            botaoErro.addEventListener(
                "click",
                fecharModalErro
            );
        }
    }
);

