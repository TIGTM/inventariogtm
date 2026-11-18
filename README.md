# Patrimonio TI e Marketing

Para publicar na HostGator com Docker, siga [DEPLOY.md](DEPLOY.md). O arquivo
`compose.yaml` e a configuracao de producao; `docker-compose.yml` e a configuracao
local anterior.

## Uso local

Execute `docker compose up -d --build` nesta pasta e abra http://localhost:8000.
O acesso HTTP esta limitado a este computador. Banco e volumes existentes foram preservados.
Escolha TI ou Marketing e informe a senha correspondente. As novas senhas estao no arquivo
`.access-initial.txt`: guarde-as em um gerenciador de senhas e remova esse arquivo depois.
As senhas antigas foram invalidadas. Nunca publique `.env`, backups ou o arquivo de senhas.

## Seguranca

- Senhas verificadas por PBKDF2-SHA256 com sal individual e 600.000 iteracoes.
- Sessao de 8 horas em cookie HttpOnly e SameSite=Strict. Logout invalida a sessao.
- Limite de 10 tentativas de login por IP em 15 minutos. O reinicio limpa sessoes e limites.
- Requisicoes de escrita exigem cabecalho X-GTM-Request e validacao de origem.
- API com usuario PostgreSQL sem privilegios administrativos; migracao usa credencial separada.
- Isolamento por departamento na API e por politica de linhas no PostgreSQL.
- Exclusao na interface arquiva registros. Auditoria preserva valores anteriores/novos,
  departamento, identificador derivado da sessao e IP; a aplicacao nao pode apagar a auditoria.
- Duas contas compartilhadas identificam o departamento, nao a pessoa. Para responsabilizacao
  individual, sera necessario criar usuarios individuais.
- Container da API sem root, disco somente leitura e imagem com lista explicita de arquivos.
- CSP bloqueia scripts inline; estilos existentes foram preservados.

## Publicacao futura na HostGator

Confirme que o plano permite executar este conjunto Python + PostgreSQL + Docker.
Nao basta enviar a pasta frontend para uma hospedagem estatica.
Configure um proxy reverso com certificado HTTPS na frente da porta local 8000.
No `.env`, defina `PUBLIC_ORIGIN=https://seu-dominio` (sem barra final) e `COOKIE_SECURE=true`.
Recrie a aplicacao com `docker compose up -d` e confira login e cookies pelo dominio HTTPS.
Mantenha o banco sem porta publica. A configuracao atual nao inclui servidor HTTPS ou certificado.
O servidor nao confia em X-Forwarded-For; atras de proxy, o limitador agrupa acessos pelo IP do proxy.
Antes de uso publico, configure proxy confiavel/limites no proxy e persistencia compartilhada de
sessoes e tentativas se houver mais de um processo ou replica. Atualmente use uma unica instancia.
Gere novas credenciais de producao e configure backups regulares com acesso restrito.

## Backup e auditoria

O backup anterior a migracao esta em `backups/pre-security.dump`; a copia do codigo anterior
esta em `backups/security-*`. Essas copias contem dados confidenciais e credenciais antigas.
A tabela `auditoria` pode ser consultada com acesso administrativo ao banco. Nao use a credencial
administrativa na API. As trilhas nao podem ser alteradas pela aplicacao, mas administradores
do banco continuam tendo autoridade para altera-las.

## Alterar senhas de acesso

Execute `python change_password.py TI` ou `python change_password.py MARKETING` na maquina
que contem `.env`, digite uma senha longa e depois `docker compose up -d app`.
Esse comando grava apenas o hash no `.env`. O reinicio invalida todas as sessoes.
