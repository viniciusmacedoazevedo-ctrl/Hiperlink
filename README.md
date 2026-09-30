# Hiperlink + PSG Dados — Landing pages

Duas landing pages institucionais:

| Rota         | Empresa                                                 | Fonte do conteúdo                        |
| ------------ | ------------------------------------------------------- | ---------------------------------------- |
| `/`          | **Hiperlink — Gestão em Tecnologia**                    | PowerPoint "Apresentação Hiperlink"      |
| `/psg-dados` | **PSG Dados — Políticas, Segurança e Governança de Dados** | PDF "PSG Dados CNJ 243" + banner da PSG |

Stack: **Vite + React + TypeScript**, **Three.js** (cenas 3D carregadas sob demanda), CSS puro com tokens, ícones `lucide-react`, fontes Montserrat/Inter auto-hospedadas.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173  e  http://localhost:5173/psg-dados
npm run build      # gera dist/ (typecheck + build)
npm run preview    # serve o build em http://localhost:4173
npm run format     # prettier
```

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

- **Clientes:** `clients.items` em `hiperlink.ts`. Para exibir o logo real de um cliente, coloque o arquivo em `src/assets/clients/`, importe-o e preencha `logo`.
- **Depoimentos:** `testimonials.items`. Troque os textos e mude `isPlaceholder` para `false`. Para ocultar a seção até ter depoimentos reais, use `showSection: false`.
- **Preços da PSG Dados:** `investment` em `psgDados.ts`.
- **Contatos:** `contact` em cada arquivo. Campos `null` não são exibidos (Hiperlink) ou aparecem como placeholder identificado (PSG Dados).

## Placeholders (informações não fornecidas nos materiais)

Nenhum dado abaixo foi inventado. Quando faltar informação, o site mostra uma estrutura identificada:

| Item                                      | Onde editar                           | Situação atual                                                    |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| Depoimentos de clientes                   | `hiperlink.ts → testimonials`         | Cards com selo "Espaço reservado" e `[DEPOIMENTO REAL DO CLIENTE A INSERIR]` |
| Logos dos clientes                        | `hiperlink.ts → clients.items[].logo` | Nome + ícone ilustrativo (como no PowerPoint)                     |
| WhatsApp da Hiperlink                     | `hiperlink.ts → contact.whatsapp`     | Não exibido (o material não identifica número de WhatsApp)        |
| Contatos da PSG Dados (telefone, WhatsApp, e-mail, site, endereço) | `psgDados.ts → contact` | `[DADO DE CONTATO DA PSG DADOS A INSERIR]` com selo "A inserir" |
| Formulário da PSG Dados                   | `psgDados.ts → contact.email`         | Aparece automaticamente quando o e-mail for preenchido            |

## Logos

- Os logos são exibidos **sem alteração** (sem recolorir, redesenhar ou distorcer). Foi feito apenas o recorte das margens brancas.
- Como os logos originais têm fundo branco e letras escuras, eles aparecem sobre uma "placa" clara para manter a leitura no tema escuro.
- **Recomendado:** enviar o logo da Hiperlink em alta resolução (SVG ou PNG ≥ 800 px). O arquivo recebido tem 200×200 px, e a área útil do logo tem só 142×47 px. Basta substituir `src/assets/logos/hiperlink-logo.png` e ajustar `width`/`height` em `src/components/common/Logo.tsx`.

## Deploy

Funciona em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages, Apache/Nginx):

- `vercel.json` já configura URLs limpas (`/psg-dados`).
- `public/_redirects` cobre o Netlify.
- Em Nginx/Apache, `dist/psg-dados/index.html` responde por `/psg-dados/`.

Os endereços absolutos (canonical, Open Graph e sitemap) assumem `https://www.gestaohiperlink.com.br`. Se o domínio for outro, ajuste em `index.html`, `psg-dados/index.html`, `public/robots.txt` e `public/sitemap.xml`.

## Performance e acessibilidade

- O Three.js só é baixado depois da primeira pintura. As cenas pausam fora da tela ou com a aba oculta, e reduzem a complexidade em telas pequenas.
- Com `prefers-reduced-motion`, as animações são desativadas e a cena 3D vira um quadro estático. Sem WebGL, é exibida uma ilustração em CSS.
- Link "Pular para o conteúdo", foco visível, menu móvel com Esc e foco preso, modais com `<dialog>` nativo, abas com navegação por setas e textos alternativos em todas as imagens.
