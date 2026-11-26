# LZ Audiovisual — site

Site de uma página da LZ Audiovisual (videomaker Luiza).

- Hoje: publicado pela Vercel a cada envio para o `main`, em https://ringlight-two.vercel.app/
- Destino final: hospedagem na HostGator (veja "Publicar na HostGator")

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Conteúdo da página e dados para o Google (meta tags e JSON-LD) |
| `styles.css` | Todos os estilos |
| `main.js` | Interações: janela de contato, cena do celular, menu, relógio do visor e formulário |
| `fonts/` | Cinzel e Plus Jakarta Sans (licença OFL, arquivos `OFL-*.txt`) |
| `clips/` | Foto da abertura, print do perfil do Instagram e os reels do portfólio |
| `og-image.jpg` | Imagem que aparece ao compartilhar o link (1200x630) |
| `.htaccess` | Configuração da HostGator: HTTPS, cabeçalhos de segurança, compressão e cache |
| `vercel.json` | Os mesmos cabeçalhos de segurança, para enquanto o site estiver na Vercel |
| `robots.txt`, `sitemap.xml` | Indexação no Google |

Não há build nem dependências: é só HTML, CSS e JavaScript.

## Testar no computador

Qualquer servidor estático serve, por exemplo:

```sh
python3 -m http.server 8000
```

e abrir http://localhost:8000. (Os vídeos precisam de um servidor que aceite requisições parciais para avançar no tempo; o da Vercel aceita.)

## Publicar na HostGator

1. No cPanel, ativar o SSL grátis do domínio (AutoSSL / "SSL/TLS Status").
2. Abrir o **Gerenciador de Arquivos** e entrar em `public_html` (ou na pasta do domínio).
3. Enviar estes arquivos e pastas, mantendo a mesma estrutura:
   - `index.html`, `styles.css`, `main.js`, `.htaccess`
   - `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `logo-lz.png`, `og-image.jpg`
   - `luiza.jpeg`, `lz.jpg`, `robots.txt`, `sitemap.xml`
   - as pastas `clips/` e `fonts/` inteiras
4. Arquivos que **não** precisam subir: `README.md`, `vercel.json`, `.gitignore` e a pasta `.git`.
5. O `.htaccess` começa com ponto e fica oculto: no Gerenciador de Arquivos, em "Configurações", marcar "Mostrar arquivos ocultos" para conferir que ele foi.

## Ao ligar o domínio próprio

Trocar `https://ringlight-two.vercel.app/` pelo endereço definitivo em:

- `index.html` (canonical, `og:url`, `og:image` e JSON-LD)
- `robots.txt` e `sitemap.xml`

## Formulário de contato

O formulário envia pelo [FormSubmit](https://formsubmit.co) (gratuito, sem conta) para `lzdigital.comercial@gmail.com`, em qualquer hospedagem. O e-mail chega com o "Responder" apontando para quem escreveu.

- **Ativação (uma vez só):** no primeiro envio, o FormSubmit manda para o Gmail um e-mail "Activate Form". É só clicar em ativar; a partir daí as mensagens chegam normalmente.
- **Trocar o e-mail que recebe:** mudar `TO` no começo do bloco "CONTATO FINAL" do `main.js` (e ativar de novo).
- **Proteções:** campo invisível `_honey` contra robôs e validação dos campos antes do envio.
- Se o FormSubmit não responder, o site abre o app de e-mail do visitante com a mensagem pronta.
- O `connect-src` da política de segurança (`.htaccess` e `vercel.json`) libera `https://formsubmit.co`.

## Ao trocar o formulário para outro serviço (Formspree ou similar)

Trocar o endereço em `ENDPOINT` no `main.js` e liberar o novo serviço em `connect-src` no `.htaccess` e no `vercel.json` (no lugar de `https://formsubmit.co`).

## Contagem de visitas

Cloudflare Web Analytics (gratuito, sem cookies). No fim do `index.html` há um comentário marcando onde colar o código gerado em dash.cloudflare.com > Web Analytics > Manage site. Os endereços da Cloudflare já estão liberados no `.htaccess` e no `vercel.json`.

O cPanel da HostGator também tem estatísticas próprias em **Métricas > Awstats**, que contam pelos registros do servidor (incluem robôs).
