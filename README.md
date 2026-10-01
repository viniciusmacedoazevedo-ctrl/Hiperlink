# Hiperlink + PSG Dados — Landing pages

Duas landing pages institucionais:

| Rota         | Empresa                                                    | Fonte do conteúdo                                                                  |
| ------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/`          | **Hiperlink — Gestão em Tecnologia**                       | PowerPoint "Apresentação Hiperlink"                                                |
| `/psg-dados` | **PSG Dados — Políticas, Segurança e Governança de Dados** | PDF "PSG Dados CNJ 243" + banner da PSG + dados comerciais informados pelo cliente |
| `/admin`     | **Área administrativa** (clientes e depoimentos)           | —                                                                                  |

Stack: **Vite + React + TypeScript**, **Three.js** (cenas 3D carregadas sob demanda), CSS puro com tokens, ícones `lucide-react`, fontes Montserrat/Inter auto-hospedadas. A área administrativa usa uma API **Node/Express** (`server/`) com banco **SQLite**.

## Como rodar

```bash
npm install
npm run dev        # site + API + /admin em http://localhost:5173
npm run build      # gera dist/ (typecheck + build)
npm start          # servidor de produção (site + API + /admin) em http://localhost:3000
npm run format     # prettier
```

## Área administrativa (`/admin`)

### Primeiro acesso

1. `npm install` (instala também o SQLite — `better-sqlite3`).
2. Copie `.env.example` para `.env` e defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo 10 caracteres).
3. Rode `npm run dev` e acesse `/admin/login` com esse e-mail e senha.

Se `ADMIN_PASSWORD` ficar vazio, em desenvolvimento é gerada uma **senha temporária mostrada no terminal**. Em produção, nenhum administrador é criado sem senha: use as variáveis acima ou

```bash
npm run admin:create -- --email voce@empresa.com.br --name "Seu nome"   # cria ou redefine a senha de um administrador
```

### Rotas do painel

| Rota                                           | Conteúdo                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `/admin/login` · `/admin/logout`               | Entrada e saída                                                           |
| `/admin/dashboard`                             | Indicadores de clientes e depoimentos, últimos cadastros, atalhos, avisos |
| `/admin/clientes` · `/novo` · `/:id/editar`    | Clientes (tabela, filtros por status, busca, lixeira)                     |
| `/admin/depoimentos` · `/novo` · `/:id/editar` | Depoimentos, com **cliente relacionado** (usa a logo do cliente)          |
| `/admin/midia`                                 | Biblioteca de imagens (logos, fotos)                                      |
| `/admin/configuracoes/usuarios`                | Usuários administrativos (somente Administrador)                          |
| `/admin/configuracoes/logs`                    | Logs de auditoria (somente Administrador)                                 |

### Regras de conteúdo

- **Status:** Rascunho, Publicado ou Arquivado. O site mostra apenas o que está **Publicado** e não excluído.
- **Nível de destaque dos clientes:**

| Nível          | No site                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Super destaque | Card grande da seção “Nossos Clientes”. **Apenas um por vez**: ao escolher outro, o anterior passa a “Destaque”. |
| Destaque       | Card da grade com borda amarela e estrela, exibido antes dos normais.                                            |
| Normal         | Card padrão da grade.                                                                                            |

- **Exclusão lógica:** excluir move para a **lixeira** (`deleted_at`); o Administrador pode restaurar.
- A ordem de exibição é definida no painel e aplicada pelo servidor.
- A seção de depoimentos fica **oculta** no site quando não há depoimentos publicados.

### Perfis

| Permissão                                  | Administrador | Editor |
| ------------------------------------------ | :-----------: | :----: |
| Criar/editar clientes, depoimentos e mídia |       ✓       |   ✓    |
| Alterar status, destaque e ordem           |       ✓       |   ✓    |
| Excluir e restaurar (lixeira)              |       ✓       |   —    |
| Usuários, perfis e logs de auditoria       |       ✓       |   —    |

### API

- **Pública (somente leitura, usada pelo site):** `GET /api/public/clients` → `{ featured, highlights, normal }` e `GET /api/public/testimonials`.
- **Administrativa (exige sessão):** `/api/admin/clients`, `/api/admin/testimonials` (GET, POST, PUT, `PATCH …/:id/status|highlight|order`, DELETE, `POST …/:id/restore`), `/api/admin/media`, `/api/admin/users`, `/api/admin/audit-logs`, `/api/admin/dashboard`.

### Dados

- Banco **SQLite** em `data/hiperlink.db` (tabelas `users`, `roles`, `sessions`, `clients`, `testimonials`, `media`, `audit_logs`) e imagens em `data/media/`. A pasta `data/` não é versionada: **faça backup dela** no servidor.
- Na primeira execução o banco é criado com o conteúdo de `server/seed.json` (os 9 clientes do PowerPoint, Grupo Potiguar como super destaque). Se existir um `data/content.json` da versão anterior do painel, ele é migrado automaticamente.
- O site usa `server/seed.json` como reserva quando a API não está disponível.

### Segurança

- Senhas com hash **scrypt** (nunca em texto puro); e-mail único; usuários ativos/inativos; registro do último acesso.
- Sessão em cookie `HttpOnly` + `SameSite=Strict` (e `Secure` em HTTPS), expira em 8 horas; o token é guardado no banco apenas como hash.
- Login bloqueia após 5 tentativas erradas em 15 minutos.
- Requisições de escrita exigem cabeçalho específico (proteção contra CSRF).
- Uploads: só PNG, JPG ou WebP de até 2 MB, com o tipo conferido pelo conteúdo do arquivo.
- Toda alteração gera **log de auditoria** (quem, quando, IP, dados anteriores e novos).
- Todos os campos são validados no servidor, e `/admin` responde com `noindex`.

## Estrutura

```
index.html                 → página "/" (SEO, Open Graph, JSON-LD)
psg-dados/index.html       → página "/psg-dados" (SEO, Open Graph)
public/                    → favicons, imagens Open Graph, robots.txt, sitemap.xml
src/
  data/
    hiperlink.ts           → TODO o conteúdo editável da Hiperlink
    psgDados.ts            → TODO o conteúdo editável da PSG Dados
  entries/                 → ponto de entrada de cada página
  pages/hiperlink/         → seções da página Hiperlink (uma por arquivo)
  pages/psg/               → seções da página PSG Dados (uma por arquivo)
  components/common/       → Header, Modal, Logo, TiltCard, Counter, WebGLStage, formulário…
  components/three/        → cenas 3D (hiperlinkScene.ts, psgScene.ts)
  hooks/                   → revelação ao rolar, parallax, seção ativa, reduced motion
  lib/                     → transição entre páginas, links de contato
  styles/                  → base.css (tokens/temas), components.css, hiperlink.css, psg.css
  assets/logos/            → logos oficiais usados no site
docs/assets-originais/     → arquivos originais recebidos (referência)
```

Cada página é um documento HTML próprio (melhor para SEO e compartilhamento). A navegação entre elas usa uma transição animada (`src/lib/pageTransition.ts`), desativada automaticamente com `prefers-reduced-motion`.

## Editando o conteúdo

Todo texto, lista, preço e contato está em `src/data/hiperlink.ts` e `src/data/psgDados.ts`. Os componentes apenas leem esses arquivos.

- **Clientes e depoimentos:** pelo painel `/admin`.
- **Preços da PSG Dados:** `investment` em `psgDados.ts` (valores “A partir de”).
- **Contatos:** `contact` em cada arquivo. Campos `null` não são exibidos.

## Informações ainda não fornecidas

Nenhum dado abaixo foi inventado:

- **Depoimentos:** nenhum cadastrado. A seção fica oculta até existir um depoimento ativo no painel.
- **Logos dos clientes:** enviar pelo painel. Enquanto não houver logo, o card mostra o nome e um ícone.

## Logos

- Os logos são exibidos **sem alteração** no desenho (sem recolorir, redesenhar ou distorcer).
- **Hiperlink:** logo completo enviado pelo cliente, já sem fundo (`src/assets/logos/hiperlink-logo.webp`), e o símbolo “HL” (`hiperlink-simbolo.webp`), usado em espaços pequenos (botão “Hiperlink” na página da PSG Dados e ícones do site). Originais em `docs/assets-originais/`.
- **PSG Dados:** fundo branco removido por `docs/remove-logo-bg.py` (`psg-dados-logo-transparent.png`). Como as letras são escuras, recebe um contorno branco fino (CSS `drop-shadow`) para leitura no fundo escuro.
- No hero, o logo aparece sobre um efeito 3D (`BrandBadge`) com brilho discreto e trilhas de circuito, sem placa branca.

## Deploy

**Com a área administrativa (recomendado):** publique num servidor Node (VPS, Render, Railway, Fly.io etc.):

```bash
npm ci && npm run build && npm start   # PORT, ADMIN_EMAIL, ADMIN_PASSWORD e DATA_DIR via ambiente
```

Use HTTPS (proxy reverso) e um volume persistente para a pasta `data/`.

**Somente estático** (Vercel, Netlify, Cloudflare Pages, Apache/Nginx): as páginas funcionam e mostram o conteúdo de `server/seed.json`, mas o `/admin` não funciona, porque depende da API.

- `vercel.json` e `public/_redirects` já configuram URLs limpas (`/psg-dados`).

Os endereços absolutos (canonical, Open Graph e sitemap) assumem `https://www.gestaohiperlink.com.br`. Se o domínio for outro, ajuste em `index.html`, `psg-dados/index.html`, `public/robots.txt` e `public/sitemap.xml`.

## Performance e acessibilidade

- O Three.js só é baixado depois da primeira pintura. As cenas pausam fora da tela ou com a aba oculta, e reduzem a complexidade em telas pequenas.
- Com `prefers-reduced-motion`, as animações são desativadas e a cena 3D vira um quadro estático. Sem WebGL, é exibida uma ilustração em CSS.
- Link "Pular para o conteúdo", foco visível, menu móvel com Esc e foco preso, modais com `<dialog>` nativo, abas com navegação por setas e textos alternativos em todas as imagens.
