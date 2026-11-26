<?php
// LZ Audiovisual — envio do formulário de contato por e-mail (HostGator / PHP).
// O formulário do site manda os dados para cá; este arquivo envia um e-mail para a Luiza
// com o "Responder" já apontando para o e-mail de quem escreveu.

// ===== CONFIGURAÇÃO =====
// Para onde vão as mensagens do site:
$DESTINO = 'lzdigital.comercial@gmail.com';
// Remetente técnico: precisa ser um e-mail do próprio domínio do site, senão o provedor
// marca como spam ou recusa. Deixe vazio para usar "nao-responda@<domínio do site>".
$REMETENTE = '';
// Limite de mensagens por visitante (por IP) a cada hora, contra spam:
$LIMITE_POR_HORA = 5;
// ========================

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder($status, $dados) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, ['ok' => false, 'erro' => 'Use o formulário do site.']);
}

// só aceita envios vindos do próprio site
$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origem !== '' && strtolower(parse_url($origem, PHP_URL_HOST) ?? '') !== $host) {
    responder(403, ['ok' => false, 'erro' => 'Envio não permitido.']);
}

// armadilhas para robôs: campo escondido preenchido ou envio rápido demais (menos de 3 segundos)
if (trim($_POST['site'] ?? '') !== '') {
    responder(200, ['ok' => true]); // finge que deu certo e descarta
}
$aberto = (int)($_POST['t'] ?? 0);
if ($aberto > 0 && (time() * 1000 - $aberto) < 3000) {
    responder(200, ['ok' => true]);
}

// limite de envios por IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
$arquivo = sys_get_temp_dir() . '/lz-contato-' . hash('sha256', $ip) . '.json';
$agora = time();
$envios = [];
if (is_file($arquivo)) {
    $lidos = json_decode((string)@file_get_contents($arquivo), true);
    if (is_array($lidos)) {
        $envios = array_values(array_filter($lidos, function ($t) use ($agora) { return is_int($t) && $t > $agora - 3600; }));
    }
}
if (count($envios) >= $LIMITE_POR_HORA) {
    responder(429, ['ok' => false, 'erro' => 'Muitas mensagens em pouco tempo. Tente de novo mais tarde ou chame no WhatsApp.']);
}

// validação (a mesma do site, repetida aqui porque o navegador pode ser burlado)
$limpar = function ($texto, $max) {
    $texto = trim(str_replace("\0", '', (string)$texto));
    return mb_substr($texto, 0, $max, 'UTF-8');
};
$nome = preg_replace('/[\r\n\t]+/', ' ', $limpar($_POST['nome'] ?? '', 100));
$email = preg_replace('/[\r\n\t ]+/', '', $limpar($_POST['email'] ?? '', 254));
$mensagem = $limpar($_POST['mensagem'] ?? '', 1500);

$erros = [];
if ($nome === '') $erros['nome'] = 'Digite o seu nome.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $erros['email'] = 'Digite um e-mail válido, como voce@email.com.';
if ($mensagem === '') $erros['mensagem'] = 'Conte um pouco sobre o projeto.';
if ($erros) {
    responder(422, ['ok' => false, 'erros' => $erros]);
}

// montagem do e-mail
$dominio = preg_replace('/^www\./', '', $host);
if ($REMETENTE === '') $REMETENTE = 'nao-responda@' . ($dominio !== '' ? $dominio : 'localhost');

$assunto = '=?UTF-8?B?' . base64_encode('Orçamento pelo site — ' . $nome) . '?=';
$nomeCabecalho = '=?UTF-8?B?' . base64_encode($nome) . '?=';
$corpo = "Nova mensagem pelo formulário do site.\n\n"
    . "Nome: $nome\n"
    . "E-mail: $email\n\n"
    . "Mensagem:\n$mensagem\n\n"
    . "—\nPara responder, é só clicar em Responder: a resposta vai direto para $email.\n";

$cabecalhos = implode("\r\n", [
    'From: =?UTF-8?B?' . base64_encode('Site LZ Audiovisual') . "?= <$REMETENTE>",
    "Reply-To: $nomeCabecalho <$email>",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: LZ Audiovisual',
]);

$enviado = @mail($DESTINO, $assunto, $corpo, $cabecalhos, '-f' . $REMETENTE);
if (!$enviado) {
    responder(500, ['ok' => false, 'erro' => 'Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp.']);
}

$envios[] = $agora;
@file_put_contents($arquivo, json_encode($envios), LOCK_EX);
responder(200, ['ok' => true]);
