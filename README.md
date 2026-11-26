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
| `contato.php` | Envia o formulário por e-mail (só funciona na HostGator, que roda PHP) |
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
   - `index.html`, `styles.css`, `main.js`, `contato.php`, `.htaccess`
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

Na HostGator o formulário envia pelo `contato.php`, que manda um e-mail para a Luiza com o "Responder" apontando para quem escreveu. No topo do arquivo:

- `$DESTINO`: e-mail que recebe as mensagens (hoje `lzdigital.comercial@gmail.com`)
- `$REMETENTE`: vazio usa `nao-responda@<domínio do site>`; precisa ser do próprio domínio para não cair no spam
- `$LIMITE_POR_HORA`: máximo de mensagens por visitante por hora

Proteções: campo invisível e tempo mínimo contra robôs, só aceita envios do próprio site, validação no servidor e bloqueio de quebras de linha nos cabeçalhos.

Onde não há PHP (Vercel, teste local), o site abre o app de e-mail do visitante com a mensagem pronta.

Teste: depois de publicar, enviar uma mensagem pelo site e conferir a caixa de entrada e o spam. Se não chegar, criar no cPanel uma conta de e-mail no domínio (ex.: `nao-responda@dominio`) e colocá-la em `$REMETENTE`.

## Ao trocar o formulário para outro serviço (Formspree ou similar)

A política de segurança (`.htaccess` e `vercel.json`) só permite conexões com o próprio site e a Cloudflare. Adicionar o endereço do serviço em `connect-src` e `form-action` nos dois arquivos, por exemplo `https://formspree.io`.

## Contagem de visitas

Cloudflare Web Analytics (gratuito, sem cookies). No fim do `index.html` há um comentário marcando onde colar o código gerado em dash.cloudflare.com > Web Analytics > Manage site. Os endereços da Cloudflare já estão liberados no `.htaccess` e no `vercel.json`.

O cPanel da HostGator também tem estatísticas próprias em **Métricas > Awstats**, que contam pelos registros do servidor (incluem robôs).
