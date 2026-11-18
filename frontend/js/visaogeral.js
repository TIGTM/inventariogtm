const quantidadeUso =
    document.getElementById(
        "quantidadeUso"
    );


const quantidadeEstoque =
    document.getElementById(
        "quantidadeEstoque"
    );


const quantidadeManutencao =
    document.getElementById(
        "quantidadeManutencao"
    );


const quantidadeSemResponsavel =
    document.getElementById(
        "quantidadeSemResponsavel"
    );


const tabelaRecentes =
    document.getElementById(
        "tabelaRecentes"
    );


const dadosEquipamentos =
    document.querySelectorAll(
        "#dadosEquipamentos .equipamento-dado"
    );


const equipamentos = [];


dadosEquipamentos.forEach(
    elemento => {

        equipamentos.push({

            id:
                elemento.dataset.id || "",

            patrimonio:
                elemento.dataset.patrimonio || "",

            categoria:
                elemento.dataset.categoria || "",

            tipo:
                elemento.dataset.tipo || "",

            marca:
                elemento.dataset.marca || "",

            modelo:
                elemento.dataset.modelo || "",

            serial:
                elemento.dataset.serial || "",

            local:
                elemento.dataset.local || "",

            setor:
                elemento.dataset.setor || "",

            status:
                normalizarStatus(
                    elemento.dataset.status
                ),

            responsavel:
                elemento.dataset.responsavel || "",

            email:
                elemento.dataset.email || "",

            telefone:
                elemento.dataset.telefone || "",

            termo:
                normalizarTermo(
                    elemento.dataset.termo
                )

        });

    }
);



function normalizarStatus(status) {

    const valor =
        (status || "")
            .trim()
            .toUpperCase();


    if (valor === "EM USO") {

        return "Em uso";

    }


    if (valor === "EM ESTOQUE") {

        return "Em estoque";

    }


    if (
        valor === "MANUTENÇÃO" ||
        valor === "MANUTENCAO" ||
        valor === "EM MANUTENÇÃO" ||
        valor === "EM MANUTENCAO"
    ) {

        return "Em manutenção";

    }


    return status || "-";

}



function normalizarTermo(termo) {

    const valor =
        (termo || "")
            .trim()
            .toUpperCase();


    if (valor === "SIM") {

        return "Sim";

    }


    if (
        valor === "NÃO" ||
        valor === "NAO"
    ) {

        return "Não";

    }


    if (valor === "N/A") {

        return "N/A";

    }


    return termo || "-";

}



function atualizarIndicadores() {


    const emUso =
        equipamentos.filter(
            equipamento =>
                equipamento.status === "Em uso"
        ).length;''



    const emEstoque =
        equipamentos.filter(
            equipamento =>
                equipamento.status === "Em estoque"
        ).length;



    const emManutencao =
        equipamentos.filter(
            equipamento =>
                equipamento.status === "Em manutenção"
        ).length;



    const semResponsavel =
        equipamentos.filter(
            equipamento =>
                (
                    equipamento.status === "Em estoque" ||
                    equipamento.status === "Em manutenção"
                )
                &&
                (
                    !equipamento.responsavel ||
                    equipamento.responsavel.trim() === ""
                )
        ).length;



    quantidadeUso.textContent =
        emUso;


    quantidadeEstoque.textContent =
        emEstoque;


    quantidadeManutencao.textContent =
        emManutencao;


    quantidadeSemResponsavel.textContent =
        semResponsavel;

}



function mostrarRecentes() {


    tabelaRecentes.innerHTML = "";



    const recentes =
        equipamentos
            .slice(0, 10);



    if (
        recentes.length === 0
    ) {


        tabelaRecentes.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center; padding:30px;"
                >

                    Nenhum equipamento cadastrado.

                </td>

            </tr>

        `;


        return;

    }



    recentes.forEach(
        equipamento => {


            const linha =
                document.createElement(
                    "tr"
                );



            let nomeEquipamento =
                equipamento.tipo || "-";



            if (
                equipamento.marca ||
                equipamento.modelo
            ) {


                nomeEquipamento = `

                    ${equipamento.tipo || ""}

                    ${equipamento.marca || ""}

                    ${equipamento.modelo || ""}

                `;

            }



            let termoTexto =
                equipamento.termo || "-";



            if (
                equipamento.termo === "Sim"
            ) {

                termoTexto =
                    "Assinado";

            }



            if (
                equipamento.termo === "Não"
            ) {

                termoTexto =
                    "Não";

            }



            if (
                equipamento.termo === "N/A"
            ) {

                termoTexto =
                    "N/A";

            }



            let classeStatus =
                "maint";



            if (
                equipamento.status ===
                "Em uso"
            ) {

                classeStatus =
                    "use";

            }



            if (
                equipamento.status ===
                "Em estoque"
            ) {

                classeStatus =
                    "stock";

            }



            if (
                equipamento.status ===
                "Em manutenção"
            ) {

                classeStatus =
                    "maint";

            }



            if (equipamento.status === "Baixa") {
                classeStatus = "low";
            }

            linha.innerHTML = `

                <td>
                    ${LocalTI.escapeHTML(equipamento.patrimonio || "-")}
                </td>


                <td>
                    ${LocalTI.escapeHTML(nomeEquipamento)}
                </td>


                <td>
                    ${LocalTI.escapeHTML(equipamento.responsavel || "-")}
                </td>


                <td>
                    ${LocalTI.escapeHTML(equipamento.local || "-")}
                </td>


                <td>

                    <span class="tag ${classeStatus}">

                        ${LocalTI.escapeHTML(equipamento.status || "-")}

                    </span>

                </td>


                <td>
                    ${LocalTI.escapeHTML(termoTexto)}
                </td>

            `;



            tabelaRecentes.appendChild(
                linha
            );

        }
    );

}



atualizarIndicadores();

mostrarRecentes();


