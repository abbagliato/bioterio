# Jovem Bioterista

Jovem Bioterista é um jogo educativo para celular que ensina às crianças a rotina de cuidado de camundongos em um biotério.

**Jogar:** https://abbagliato.github.io/bioterio/

## O que a criança aprende

1. Vestir o EPI na ordem certa (lavar as mãos esfregando o dedo na tela, propé, jaleco, touca, máscara, óculos e luvas).
2. Montar a gaiola microisoladora: maravalha, enriquecimento (ninho, rolo ou iglu), animais, grade, água, ração e tampa.
3. Formar o grupo de reprodução com 1 macho e 1 ou 2 fêmeas.
4. Repor ração e água e trocar a gaiola suja.
5. Desmamar os filhotes aos 21 dias, separando machos e fêmeas.
6. Cuidar de várias gaiolas ao mesmo tempo.

No final, a criança baixa um certificado em imagem com o nome e a pontuação.

## QR Code

O jogo só abre pelo QR Code, que aponta para `https://abbagliato.github.io/bioterio/#jogar`. Cada leitura vale para uma partida: ao terminar, recarregar ou fechar a página, é preciso escanear de novo. Nada fica salvo no celular.

Para mostrar o QR Code numa tela (por exemplo, num computador no estande), abra `https://abbagliato.github.io/bioterio/#organizador`.

## Ajustes

Tudo fica em `index.html`. Textos, tempos e pontuação estão no objeto `CFG` e nas listas `ORDEM`, `EPI` e `GLOSSARIO` no início do script.
