
let equipamentoSelecionado = null;

document.addEventListener("DOMContentLoaded", function () {
    preencherDataAtual();
    carregarEquipamentoSelecionado();
    alterarStatus();
});

function carregarEquipamentoSelecionado() {

    const campoId =
        document.getElementById("equipamentoId");

    if (!campoId) {
        equipamentoSelecionado = null;
        return;
    }

    const id =
        String(campoId.value || "").trim();

    if (!id) {
        equipamentoSelecionado = null;
        return;
    }

    equipamentoSelecionado = {
        id: id
    };
}


function preencherDataAtual() {

    const campo =
        document.getElementById("dataMovimento");

    if (!campo) {
        return;
    }

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    campo.value =
        `${ano}-${mes}-${dia}`;
}


function alterarStatus() {

    const status =
        document.getElementById("statusNovo");

    const camposUso =
        document.getElementById("camposUso");

    const camposLocal =
        document.getElementById("camposLocal");

    if (!status) {
        return;
    }

    if (camposUso) {
        camposUso.classList.remove("ativo");
    }

    if (camposLocal) {
        camposLocal.classList.remove("ativo");
    }


    if (status.value === "Em uso") {

        if (camposUso) {
            camposUso.classList.add("ativo");
        }

    }


    if (
        status.value === "Em estoque" ||
        status.value === "Em manutenção"
    ) {

        if (camposLocal) {
            camposLocal.classList.add("ativo");
        }

    }
}


function montarDados() {

    const campoId =
        document.getElementById("equipamentoId");

    const data =
        document.getElementById("dataMovimento");

    const status =
        document.getElementById("statusNovo");

    const responsavel =
        document.getElementById("responsavel");

    const email =
        document.getElementById("email");

    const telefone =
        document.getElementById("telefone");

    const local =
        document.getElementById(["Em estoque", "Em manutenção"].includes(status?.value) ? "localDestino" : "local");

    const setor =
        document.getElementById("setor");

    const termo =
        document.getElementById("termo");

    const motivo =
        document.getElementById("motivo");

    const observacoes =
        document.getElementById("observacoes");


    return {

        equipamentoId:
            campoId
                ? campoId.value.trim()
                : "",

        dataMovimento:
            data
                ? data.value
                : "",

        statusNovo:
            status
                ? status.value
                : "",

        responsavel:
            responsavel
                ? responsavel.value.trim()
                : "",

        email:
            email
                ? email.value.trim()
                : "",

        telefone:
            telefone
                ? telefone.value.trim()
                : "",

        local:
            local
                ? local.value.trim()
                : "",

        setor:
            setor
                ? setor.value.trim()
                : "",

        termo:
            termo
                ? termo.value
                : "",

        motivo:
            motivo
                ? motivo.value.trim()
                : "",

        observacoes:
            observacoes
                ? observacoes.value.trim()
                : ""
    };
}


async function salvarMovimentacao(event) {

    event.preventDefault();


    const campoId =
        document.getElementById("equipamentoId");


    if (
        !campoId ||
        !campoId.value ||
        !campoId.value.trim()
    ) {

        alert(
            "Nenhum equipamento selecionado."
        );

        return;
    }


    const dados =
        montarDados();


    if (!dados.dataMovimento) {

        alert(
            "Informe a data da movimentação."
        );

        return;
    }


    if (!dados.statusNovo) {

        alert(
            "Selecione o status."
        );

        return;
    }


    if (
        dados.statusNovo.trim().toUpperCase() === "BAIXA" &&
        !dados.motivo
    ) {

        alert(
            "Informe o motivo da Baixa do equipamento."
        );

        const campoMotivo =
            document.getElementById("motivo");

        if (campoMotivo) {
            campoMotivo.focus();
        }

        return;
    }


    try {
        await LocalTI.move(dados);
        window.location.href = "patrimonio.html";
    } catch (erro) {
        LocalTI.showError(erro.message);
    }

}


function limparFormulario() {

    const form =
        document.getElementById(
            "formMovimentacao"
        );


    if (!form) {
        return;
    }


    const id =
        document.getElementById(
            "equipamentoId"
        );


    const equipamentoId =
        id
            ? id.value
            : "";


    form.reset();


    if (id) {

        id.value =
            equipamentoId;
    }


    equipamentoSelecionado =
        equipamentoId
            ? {
                id: equipamentoId
            }
            : null;


    preencherDataAtual();

    alterarStatus();


    const camposUso =
        document.getElementById(
            "camposUso"
        );

    const camposLocal =
        document.getElementById(
            "camposLocal"
        );


    if (camposUso) {
        camposUso.classList.remove("ativo");
    }

    if (camposLocal) {
        camposLocal.classList.remove("ativo");
    }
}


function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }


    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
