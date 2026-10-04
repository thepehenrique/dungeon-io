# Dungeon.io

Base inicial de um dungeon crawler 2D para navegador, construída com Vite, TypeScript e Phaser.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Instalação e execução

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no terminal.

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Controles

- `W`, `A`, `S`, `D`: movimentar o personagem.
- Mouse: definir a direção para a qual o personagem olha.

Ataques ainda não foram implementados.

## Estrutura básica

- `src/game/config`: configuração do Phaser e dados configuráveis.
- `src/game/constants`: dimensões e chaves compartilhadas.
- `src/game/scenes`: cenas de boot, menu, dungeon e game over.
- `src/game/player`: entidade do jogador, controles e placeholders visuais.
- `src/game/dungeon`: construção do mapa fixo e paredes.
- `src/game/state`: estado centralizado da run.
- `src/game/types`: contratos TypeScript do domínio.
- `src/ui`: interface HTML externa ao canvas.
- `src/styles`: estilos globais e do menu.

## Estado atual

- Fluxo `Boot → Menu → Dungeon → Game Over`.
- Nome e classe são validados antes de iniciar.
- Uma nova run é criada no `GameSession`, sem uso de `localStorage`.
- A dungeon exibe o nome e a classe selecionada.
- O jogador pode se mover com WASD e acompanha a posição do mouse.
- A câmera segue o jogador dentro de um mundo maior que a viewport.
- Paredes externas e internas possuem colisão física.
- É possível reiniciar a run ou voltar ao menu.

Ainda não há atributos específicos por classe, combate, inimigos ou progressão; esses itens pertencem às próximas etapas.
