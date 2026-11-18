# Publicar Patrimônios TI e Marketing na HostGator

Este pacote usa **Python/FastAPI** na API, **Nginx** para os arquivos HTML/CSS/JS e **PostgreSQL**. O `compose.yaml` inclui também a migração. O volume Docker `dados_postgres` guarda os dados do banco entre recriações dos containers.

## 1. Plano e domínio

É necessário um **VPS ou servidor dedicado com Docker Engine e Docker Compose**, acesso SSH e um domínio apontado para o servidor. Hospedagem compartilhada que só publica arquivos pelo cPanel não executa este Compose.

O especialista deve configurar HTTPS no proxy reverso do servidor e encaminhar o domínio para `http://127.0.0.1:8080`. Apenas o proxy HTTPS deve ficar público. API e PostgreSQL ficam na rede interna do Docker, sem portas públicas. Se outro site já usa 8080, ajuste `HTTP_PORT` no `.env` e no proxy.

## 2. Arquivos para o Git

Envie o código do projeto, `Dockerfile`, `compose.yaml`, `.dockerignore`, `frontend/Dockerfile`, `frontend/nginx.conf`, `frontend/.dockerignore`, `.env.example`, `migrate.py`, `change_password.py` e este guia. O `.gitignore` exclui `.env`, senhas iniciais, backups e planilhas locais. Confira os arquivos antes do primeiro commit. **Não envie** `.env`, `backups/`, `PATRIMONIO_TI.xlsx`, `HISTORICO_TI.xlsx` nem dumps do banco.

## 3. Preparar o servidor

No diretório do repositório clonado no VPS:

```bash
cp .env.example .env
chmod 600 .env
```

Edite `.env` no servidor:

- `DB_ADMIN_PASSWORD`: senha forte e exclusiva do administrador do PostgreSQL.
- `APP_DB_PASSWORD`: outra senha forte e exclusiva para a API.
- `PUBLIC_ORIGIN`: endereço final, por exemplo `https://patrimonio.suaempresa.com.br`, sem barra final.
- `HTTP_BIND_ADDRESS=127.0.0.1` e `HTTP_PORT=8080`: endereço local que o proxy HTTPS acessará.

Use senhas de banco que não contenham caracteres que exigem codificação em URL, ou codifique esses caracteres na cadeia de conexão antes de subir. Não use a senha administrativa do banco na API.

Crie as duas senhas de acesso. O script pede a senha sem exibi-la e grava apenas o hash no `.env`:

```bash
python3 change_password.py TI
python3 change_password.py MARKETING
chmod 600 .env
```

Se o VPS não tiver `python3` instalado fora dos containers, execute o mesmo script com uma imagem Python, a partir da pasta do projeto:

```bash
docker run --rm -it -v "$PWD:/work" -w /work python:3.13-slim python change_password.py TI
docker run --rm -it -v "$PWD:/work" -w /work python:3.13-slim python change_password.py MARKETING
chmod 600 .env
```

Não existe conta de administrador separada neste sistema: **TI e Marketing são os dois acessos**. Cada um vê somente seus equipamentos. As senhas são compartilhadas por departamento; quem tiver a senha do TI tem acesso ao TI.

## 4. Migração e inicialização

```bash
docker compose -f compose.yaml config --quiet
docker compose -f compose.yaml up -d db
docker compose -f compose.yaml run --rm migrate
docker compose -f compose.yaml up -d --build api frontend
docker compose -f compose.yaml ps
```

O serviço `migrate` cria/atualiza as tabelas, permissões, auditoria e isolamento entre departamentos. Ele também é executado como dependência da API pelo Compose; a chamada explícita acima mostra o resultado da primeira migração. Para consultar os logs sem mostrar senhas, use `docker compose -f compose.yaml logs --tail=100 migrate api frontend`.

Configure o proxy HTTPS do domínio para `127.0.0.1:8080` e mantenha a porta 8080 restrita ao próprio servidor. Teste login, cadastro, movimentações, TI e Marketing pelo domínio HTTPS. A interface já usa `/api` e `/api/marketing`, portanto não precisa editar URLs do JavaScript para cada domínio. Defina redirecionamento HTTP → HTTPS e HSTS no proxy público.

## 5. Atualizações e dados

Antes de atualizar, faça backup do volume PostgreSQL. Depois:

```bash
git pull
docker compose -f compose.yaml up -d --build
```

**Não use `docker compose down -v`**, pois `-v` remove o volume do banco. Faça backups periódicos do PostgreSQL fora do VPS, com acesso restrito. O volume preserva dados na recriação de containers, mas não substitui backup.

Para trocar uma senha de acesso, rode `python3 change_password.py TI` ou `python3 change_password.py MARKETING` no servidor e depois `docker compose -f compose.yaml up -d --force-recreate api`. A recriação da API encerra as sessões atuais.

## 6. Limites que o especialista deve considerar

Este Compose usa **uma instância** da API. Sessões e limite de tentativas de login ficam na memória dessa instância; reiniciar encerra sessões. Atrás do proxy, o limitador pode ver todos os usuários com o IP do proxy. Configure limite de requisições no proxy por IP real e não publique a API diretamente. Verifique também capacidade de memória, espaço para backups, atualizações de imagens e acesso ao Docker no plano contratado.
