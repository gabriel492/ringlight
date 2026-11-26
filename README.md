# LZ Audiovisual — site

Site de uma página da LZ Audiovisual (videomaker Luiza). Publicado pela Vercel a cada envio para o `main`.

- Endereço atual: https://ringlight-two.vercel.app/

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Conteúdo da página e dados para o Google (meta tags e JSON-LD) |
| `styles.css` | Todos os estilos |
| `main.js` | Interações: janela de contato, cena do celular, menu, relógio do visor e formulário |
| `fonts/` | Cinzel e Plus Jakarta Sans (licença OFL, arquivos `OFL-*.txt`) |
| `clips/` | Foto da abertura, print do perfil do Instagram e os reels do portfólio |
| `og-image.jpg` | Imagem que aparece ao compartilhar o link (1200x630) |
| `vercel.json` | Cabeçalhos de segurança (CSP e afins) |
| `robots.txt`, `sitemap.xml` | Indexação no Google |

Não há build nem dependências: é só HTML, CSS e JavaScript.

## Testar no computador

Qualquer servidor estático serve, por exemplo:

```sh
python3 -m http.server 8000
```

e abrir http://localhost:8000. (Os vídeos precisam de um servidor que aceite requisições parciais para avançar no tempo; o da Vercel aceita.)

## Ao ligar o domínio próprio

Trocar `https://ringlight-two.vercel.app/` pelo novo endereço em:

- `index.html` (canonical, `og:url`, `og:image` e JSON-LD)
- `robots.txt` e `sitemap.xml`

## Ao trocar o formulário para envio direto (Formspree ou outro)

A política de segurança em `vercel.json` só permite conexões com o próprio site. Adicionar o endereço do serviço em `connect-src` e `form-action`, por exemplo `https://formspree.io`.

## Contagem de visitas

O script `/_vercel/insights/script.js` só funciona depois de ativar **Web Analytics** no painel do projeto na Vercel.
