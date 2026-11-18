import os
from psycopg import sql
from server import init_db, connection

init_db()
with connection() as conn:
    if not conn.execute("SELECT 1 FROM pg_roles WHERE rolname = 'patrimonio_app'").fetchone():
        conn.execute("CREATE ROLE patrimonio_app LOGIN")
    conn.execute(sql.SQL("ALTER ROLE patrimonio_app NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD {}").format(sql.Literal(os.environ["APP_DB_PASSWORD"])))
    conn.execute("REVOKE CREATE ON SCHEMA public FROM PUBLIC")
    conn.execute("REVOKE ALL ON DATABASE gestao_ti FROM PUBLIC")
    conn.execute("GRANT CONNECT ON DATABASE gestao_ti TO patrimonio_app")
    conn.execute("GRANT USAGE ON SCHEMA public TO patrimonio_app")
    for table in ("equipamentos", "movimentacoes"):
        conn.execute(sql.SQL("ALTER TABLE {} ADD COLUMN IF NOT EXISTS excluido BOOLEAN NOT NULL DEFAULT false").format(sql.Identifier(table)))
        conn.execute(sql.SQL("GRANT SELECT, INSERT, UPDATE ON {} TO patrimonio_app").format(sql.Identifier(table)))
        conn.execute(sql.SQL("ALTER TABLE {} ENABLE ROW LEVEL SECURITY").format(sql.Identifier(table)))
        conn.execute(sql.SQL("DROP POLICY IF EXISTS isolamento_departamento ON {}").format(sql.Identifier(table)))
        conn.execute(sql.SQL("CREATE POLICY isolamento_departamento ON {} TO patrimonio_app USING (setor = (NULLIF(current_setting('app.actor', true), '')::jsonb ->> 'sector')) WITH CHECK (setor = (NULLIF(current_setting('app.actor', true), '')::jsonb ->> 'sector'))").format(sql.Identifier(table)))
    conn.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO patrimonio_app")
    conn.execute("CREATE TABLE IF NOT EXISTS auditoria (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT now(), ator JSONB NOT NULL, tabela TEXT NOT NULL, operacao TEXT NOT NULL, anterior JSONB, novo JSONB)")
    conn.execute("REVOKE ALL ON auditoria FROM PUBLIC, patrimonio_app")
    conn.execute("""CREATE OR REPLACE FUNCTION public.registrar_auditoria() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
    BEGIN
        INSERT INTO public.auditoria(ator, tabela, operacao, anterior, novo)
        VALUES (COALESCE(NULLIF(current_setting('app.actor', true), ''), '{}')::jsonb, TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    END; $$""")
    conn.execute("REVOKE ALL ON FUNCTION public.registrar_auditoria() FROM PUBLIC")
    for table in ("equipamentos", "movimentacoes"):
        conn.execute(sql.SQL("DROP TRIGGER IF EXISTS auditar ON {}").format(sql.Identifier(table)))
        conn.execute(sql.SQL("CREATE TRIGGER auditar AFTER INSERT OR UPDATE OR DELETE ON {} FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria()").format(sql.Identifier(table)))
print("Migracao de seguranca concluida; dados preservados.")
