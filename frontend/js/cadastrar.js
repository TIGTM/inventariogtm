const tipoAtivo =
    document.getElementById("tipoAtivo");

const formComputador =
    document.getElementById("formComputador");

const formCelular =
    document.getElementById("formCelular");

const formComum =
    document.getElementById("formComum");

const btnSalvar =
    document.getElementById("btnSalvar");

let salvando = false;


/* =========================================================
   ESCONDER FORMULÁRIOS
========================================================= */

function esconderFormularios() {

    formComputador.style.display = "none";
    formCelular.style.display = "none";
    formComum.style.display = "none";

}


/* =========================================================
   CONTROLAR TIPO DE ATIVO
========================================================= */

function controlarTipo() {

    esconderFormularios();

    if (tipoAtivo.value === "computador") {
        formComputador.style.display = "block";
    }

    if (tipoAtivo.value === "celular") {
        formCelular.style.display = "block";
    }

    if (tipoAtivo.value === "comum") {
        formComum.style.display = "block";
    }

}


tipoAtivo.addEventListener(
    "change",
    controlarTipo
);


/* =========================================================
   PEGAR VALOR DO CAMPO
========================================================= */

function valor(id) {

    const campo =
        document.getElementById(id);

    if (!campo) {
        return "";
    }

    return campo.value.trim();

}


/* =========================================================
   MODAL DE ERRO
========================================================= */

function abrirModalErro(mensagem) {

    const modal =
        document.getElementById("modalErro");

    const mensagemErro =
        document.getElementById("mensagemErro");

    if (!modal || !mensagemErro) {

        alert(mensagem);

        return;
    }

    mensagemErro.innerText =
        mensagem;

    modal.style.display =
        "flex";
}


/* =========================================================
   BOTÃO SALVAR
========================================================= */

btnSalvar.addEventListener(
    "click",
    async function () {

        if (salvando) {
            return;
        }


        /* -----------------------------------------
           VALIDAÇÕES
        ----------------------------------------- */

        if (!tipoAtivo.value) {

            alert(
                "Selecione o tipo de ativo."
            );

            return;
        }


        if (!valor("patrimonio")) {

            alert(
                "Informe o patrimônio interno."
            );

            return;
        }


        if (!valor("marca")) {

            alert(
                "Informe a marca."
            );

            return;
        }


        if (!valor("modelo")) {

            alert(
                "Informe o modelo."
            );

            return;
        }


        /* -----------------------------------------
           OBJETO DO EQUIPAMENTO
        ----------------------------------------- */

        let equipamento = {

            categoria: "",
            tipo: "",

            patrimonio:
                valor("patrimonio"),

            marca:
                valor("marca"),

            modelo:
                valor("modelo"),

            processador: "",
            memoria: "",
            armazenamento: "",
            sistemaOperacional: "",

            numeroSerie: "",
            serial: "",

            etiquetaFabricante: "",
            nomeRede: "",

            imei1: "",
            imei2: "",
            capacidade: "",
            cor: "",

            tipoComum: "",
            condicao: "",
            descricao: "",
            observacoes: "",

            compra:
                valor("compra"),

            fornecedor:
                valor("fornecedor"),

            nf:
                valor("nf"),

            valor:
                valor("valor"),

            garantia:
                valor("garantia")

        };


        /* =================================================
           COMPUTADOR
        ================================================= */

        if (
            tipoAtivo.value === "computador"
        ) {

            equipamento.categoria =
                "Notebook / Desktop";

            equipamento.tipo =
                "Notebook / Desktop";

            equipamento.processador =
                valor("processador");

            equipamento.memoria =
                valor("memoria");

            equipamento.armazenamento =
                valor("armazenamento");

            equipamento.sistemaOperacional =
                valor("sistemaOperacional");

            equipamento.numeroSerie =
                valor("numeroSerieComputador");

            equipamento.serial =
                equipamento.numeroSerie;

            equipamento.etiquetaFabricante =
                valor("etiquetaFabricante");

            equipamento.nomeRede =
                valor("nomeRede");

        }


        /* =================================================
           CELULAR
        ================================================= */

        if (
            tipoAtivo.value === "celular"
        ) {

            equipamento.categoria =
                "Celular / Tablet";

            equipamento.tipo =
                "Celular / Tablet";

            equipamento.numeroSerie =
                valor("numeroSerieCelular");

            equipamento.serial =
                equipamento.numeroSerie;

            equipamento.imei1 =
                valor("imei1");

            equipamento.imei2 =
                valor("imei2");

            equipamento.capacidade =
                valor("capacidade");

            equipamento.cor =
                valor("cor");

        }


        /* =================================================
           COMUM
        ================================================= */

        if (
            tipoAtivo.value === "comum"
        ) {

            equipamento.categoria =
                "Comum";

            equipamento.tipo =
                valor("tipoComum");

            equipamento.tipoComum =
                valor("tipoComum");

            equipamento.numeroSerie =
                valor("serial");

            equipamento.serial =
                equipamento.numeroSerie;

            equipamento.condicao =
                valor("condicao");

            equipamento.descricao =
                valor("descricao");

            equipamento.observacoes =
                valor("observacoes");

        }


        /* =================================================
           SALVAR
        ================================================= */

        try {
            salvando = true;
            btnSalvar.disabled = true;
            btnSalvar.innerText = "SALVANDO...";
            await LocalTI.create(equipamento);
            document.getElementById("modalSucesso").style.display = "flex";
        } catch (erro) {
            abrirModalErro(erro.message);
            salvando = false;
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "SALVAR EQUIPAMENTO";
        }

    }
);


/* =========================================================
   BOTÃO OK DO MODAL DE SUCESSO
========================================================= */

document
    .getElementById("okSucesso")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "modalSucesso"
            ).style.display = "none";


            window.location.href =
                "patrimonio.html";

        }
    );


/* =========================================================
   BOTÃO OK DO MODAL DE ERRO
========================================================= */

const okErro =
    document.getElementById("okErro");

if (okErro) {

    okErro.addEventListener(
        "click",
        () => {

            document.getElementById(
                "modalErro"
            ).style.display = "none";

        }
    );

}




esconderFormularios();
