window.BASE_FOLDER = '';
(() => {
const actions = {
  "a0": function(event) { window.location.href='patrimonio.html' },
  "a1": function(event) { window.location.href='visaogeral.html' },
  "a2": function(event) { window.location.href='patrimonio.html' },
  "a3": function(event) { window.location.href='patrimonio.html' },
  "a4": function(event) { window.location.href='visaogeral.html' },
  "a5": function(event) { window.location.href='patrimonio.html' },
  "a6": function(event) { window.location.href='cadastrar.html' },
  "a7": function(event) { salvarEdicao(); return false; },
  "a8": function(event) { window.location.href='patrimonio.html' },
  "a9": function(event) { voltarPatrimonio() },
  "a10": function(event) { window.location.href='visaogeral.html' },
  "a11": function(event) { window.location.href='patrimonio.html' },
  "a12": function(event) { window.location.href='cadastrar.html' },
  "a13": function(event) { window.location.href='visaogeral.html' },
  "a14": function(event) { window.location.href='patrimonio.html' },
  "a15": function(event) { window.location.href='cadastrar.html' },
  "a16": function(event) { window.location.href='visaogeral.html' },
  "a17": function(event) { window.location.href='patrimonio.html' },
  "a18": function(event) { window.location.href='cadastrar.html' },
  "a20": function(event) { salvarMovimentacao(event) },
  "a21": function(event) { alterarStatus() },
  "a22": function(event) { limparFormulario() },
  "a23": function(event) { window.location.href='visaogeral.html' },
  "a24": function(event) { window.location.href='visaogeral.html' },
  "a25": function(event) { window.location.href='patrimonio.html' },
  "a26": function(event) { window.location.href='cadastrar.html' },
  "a27": function(event) { window.location.href='movimentacoes.html' },
  "a28": function(event) { window.location.href='cadastrar.html' },
  "a29": function(event) { fecharModalInformacoes() },
  "a30": function(event) { fecharModalInformacoes() },
  "a31": function(event) { fecharModalHistorico() },
  "a32": function(event) { fecharModalHistorico() },
  "a33": function(event) { fecharConfirmacaoExcluirHistorico() },
  "a34": function(event) { confirmarExclusaoHistorico() },
  "a35": function(event) { fecharModalExclusaoSucesso() },
  "a36": function(event) { fecharModalAcoes() },
  "a37": function(event) { editarEquipamentoSelecionado() },
  "a38": function(event) { movimentarEquipamentoSelecionado() },
  "a39": function(event) { acaoHistorico() },
  "a40": function(event) { excluirEquipamentoSelecionado() },
  "a41": function(event) { fecharModalAcoes() },
  "a42": function(event) { fecharConfirmacaoExcluirEquipamento() },
  "a43": function(event) { confirmarExclusaoEquipamento() },
  "a44": function(event) { window.location.href='visaogeral.html' },
  "a45": function(event) { window.location.href='patrimonio.html' },
  "a46": function(event) { window.location.href='cadastrar.html' },
};
for (const type of ['click', 'change', 'submit']) {
  document.addEventListener(type, event => {
    const element = event.target.closest('[data-ui-' + type + ']');
    if (element && actions[element.getAttribute('data-ui-' + type)]) {
      const result = actions[element.getAttribute('data-ui-' + type)].call(element, event);
      if (result === false) { event.preventDefault(); event.stopPropagation(); }
    }
  });
}
document.addEventListener('click', event => {
  const el = event.target.closest('[data-history-action]');
  if (!el) return;
  const id = el.dataset.historyId;
  if (!/^\d+$/.test(id)) return;
  if (el.dataset.historyAction === 'toggle') abrirDetalhesHistorico(Number(id));
  if (el.dataset.historyAction === 'menu') abrirMenuHistorico(event, id);
  if (el.dataset.historyAction === 'delete') abrirConfirmacaoExcluirHistorico(event, id);
});
})();
