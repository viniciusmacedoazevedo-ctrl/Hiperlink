# Hiperlink + PSG Dados — Landing pages

Duas landing pages institucionais:

| Rota         | Empresa                                                 | Fonte do conteúdo                        |
| ------------ | ------------------------------------------------------- | ---------------------------------------- |
| `/`          | **Hiperlink — Gestão em Tecnologia**                    | PowerPoint "Apresentação Hiperlink"      |
| `/psg-dados` | **PSG Dados — Políticas, Segurança e Governança de Dados** | PDF "PSG Dados CNJ 243" + banner da PSG + dados comerciais informados pelo cliente |
| `/admin`     | **Área administrativa** (clientes e depoimentos)         | —                                        |

Stack: **Vite + React + TypeScript**, **Three.js** (cenas 3D carregadas sob demanda), CSS puro com tokens, ícones `lucide-react`, fontes Montserrat/Inter auto-hospedadas. A área administrativa usa uma API **Node/Express** (`server/`) com armazenamento em JSON.

## Como rodar

```bash
npm install
npm run dev        # site + API + /admin em http://localhost:5173
npm run build      # gera dist/ (typecheck + build)
npm start          # servidor de produção (site + API + /admin) em http://localhost:3000
npm run format     # prettier
```

## Área administrativa (`/admin`)

1. Copie `.env.example` para `.env` e defina `ADMIN_PASSWORD` (ou `ADMIN_PASSWORD_HASH`, gerado com `npm run admin:hash -- "sua senha"`).
2. Rode `npm run dev` e acesse `/admin`. Sem senha definida, em desenvolvimento é gerada uma **senha temporária mostrada no terminal**. Em produção, o login fica desativado até a senha ser configurada.

O painel tem:

- **Dashboard:** totais de clientes, clientes ativos, clientes em destaque, depoimentos e depoimentos ativos.
- **Clientes:** listar, cadastrar, editar e excluir. Os campos são nome, logo (upload), descrição, segmento, texto do case, serviços prestados, status ativo/inativo, ordem de exibição e nível de destaque.
- **Depoimentos:** listar, cadastrar, editar, excluir e ordenar. Os campos são empresa, pessoa, cargo, logo, foto (opcional), depoimento, status, ordem e destaque.
- **Configurações:** escolher o super destaque, marcar os destaques e definir a ordem de exibição.

Níveis de destaque dos clientes:

| Nível          | No site                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| Super destaque | Card grande da seção “Nossos Clientes” (apenas um cliente por vez).     |
| Destaque       | Card da grade com borda amarela e estrela, exibido antes dos normais.   |
| Normal         | Card padrão da grade.                                                   |

- A seção de depoimentos mostra só os **ativos** e fica **oculta** quando não há nenhum.
- Os dados ficam em `data/content.json` e as imagens em `data/uploads/`. A pasta `data/` não é versionada, então faça backup dela no servidor.
- O conteúdo inicial (os 9 clientes do PowerPoint, com o Grupo Potiguar como super destaque) está em `server/seed.json`. Ele é usado na primeira execução e como reserva quando a API não está disponível.

Segurança:

- A sessão fica em cookie `HttpOnly` + `SameSite=Strict` (e `Secure` em HTTPS) e expira em 8 horas.
- O login bloqueia após 5 tentativas erradas em 15 minutos.
- As requisições de escrita exigem um cabeçalho específico, como proteção contra CSRF.
- Os uploads aceitam só PNG, JPG ou WebP de até 2 MB, com o tipo conferido pelo conteúdo do arquivo.
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
- No hero, cada logo aparece numa lâmina 3D de superfície clara (`BrandBadge`), com borda luminosa, brilho discreto e trilhas de circuito. Nessa lâmina é usada uma versão com o fundo branco convertido em transparência (`*-logo-transparent.png`), com o mesmo desenho.
- O logo do cabeçalho só aparece depois do hero, para a marca não se repetir na mesma área.
- **Recomendado:** enviar o logo da Hiperlink em alta resolução (SVG ou PNG ≥ 800 px). O arquivo recebido tem 200×200 px, e a área útil do logo tem só 142×47 px. Basta substituir `src/assets/logos/hiperlink-logo.png` e ajustar `width`/`height` em `src/components/common/Logo.tsx`.

## Deploy

**Com a área administrativa (recomendado):** publique num servidor Node (VPS, Render, Railway, Fly.io etc.):

```bash
npm ci && npm run build && npm start   # PORT, ADMIN_PASSWORD(_HASH) e DATA_DIR via ambiente
```

Use HTTPS (proxy reverso) e um volume persistente para a pasta `data/`.

**Somente estático** (Vercel, Netlify, Cloudflare Pages, Apache/Nginx): as páginas funcionam e mostram o conteúdo de `server/seed.json`, mas o `/admin` não funciona, porque depende da API.

- `vercel.json` e `public/_redirects` já configuram URLs limpas (`/psg-dados`).

Os endereços absolutos (canonical, Open Graph e sitemap) assumem `https://www.gestaohiperlink.com.br`. Se o domínio for outro, ajuste em `index.html`, `psg-dados/index.html`, `public/robots.txt` e `public/sitemap.xml`.

## Performance e acessibilidade

- O Three.js só é baixado depois da primeira pintura. As cenas pausam fora da tela ou com a aba oculta, e reduzem a complexidade em telas pequenas.
- Com `prefers-reduced-motion`, as animações são desativadas e a cena 3D vira um quadro estático. Sem WebGL, é exibida uma ilustração em CSS.
- Link "Pular para o conteúdo", foco visível, menu móvel com Esc e foco preso, modais com `<dialog>` nativo, abas com navegação por setas e textos alternativos em todas as imagens.
