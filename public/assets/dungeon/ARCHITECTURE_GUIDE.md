# Mapa conectado: Catacumbas e Covil dos Goblins

O mapa passou de **84 × 58 para 120 × 58 tiles**. Continua ortogonal, finito,
com tiles de 16 × 16 e escala 3 no Phaser: mundo de **5760 × 2784 px**
(antes 4032 × 2784). Câmera, física e névoa usam as dimensões do TMJ.

## Fonte e edição no Tiled

Abra `catacumbas-84x58-source.tmj` no Tiled. O nome histórico foi mantido por
compatibilidade com o pipeline; as dimensões reais são 120 × 58.
Os 14 tilesets estão incorporados e seus PNGs ficam nesta mesma pasta.
Edite a fonte e gere novamente o runtime; não edite `dungeon-01.tmj` diretamente.

```bash
python3 scripts/generate_dungeon_map.py
python3 scripts/test_dungeon_map.py
npm run build
```

O gerador copia a arquitetura da fonte e acrescenta as camadas técnicas.
Não recria a geometria da caverna.

## Estrutura e ligação

A parede leste da sala Tesouro abre uma passagem de três tiles de largura,
na altura das linhas 11–13. O limite lógico entre regiões é a coluna 84.
A única alteração nas catacumbas está na entrada, colunas 77–83, linhas 10–14:
pedra antiga rompida, piso misto, musgo, terra e rocha natural.
O restante da arquitetura anterior foi preservado.

O covil contém três câmaras de combate e uma área lateral opcional:

| Área | Centro aproximado (tiles) | Organização |
| --- | --- | --- |
| Vigia | 94, 10 | Câmara pequena com suprimentos e braseiro na entrada |
| Depósito | 105, 21 | Câmara média com caixas, barris, rocha e fungos |
| Acampamento | 103, 39 | Câmara grande, fogueira central, tendas periféricas, mesa, armazenamento, estandartes e paliçadas na entrada |
| Recanto dos fungos | 115, 30 | Ramificação com poça, ossos e cogumelos; sem orçamento de combate próprio |

As câmaras usam contornos irregulares, túnel curvo de entrada, conexão entre
depósito e acampamento e um túnel curto no canto sudoeste. Toda a circulação
acontece na mesma `DungeonScene`, caminhando pelo mesmo mapa.

## Assets e camadas

Os originais fornecidos, ambos de 1254 × 1254, ficam em
`assets-source/goblin-den/` na raiz do projeto e não são publicados pelo Vite.
O panorama foi usado como referência de composição.

`scripts/prepare_goblin_den_assets.py` (Pillow) prepara recortes explícitos,
remove fragmentos de sprites vizinhos e usa nearest-neighbor. Os pisos usam
recortes quadrados; props mantêm proporção com preenchimento transparente.
Não sobrescreve os originais. Execute apenas para reconstruir os atlas:

```bash
python3 scripts/prepare_goblin_den_assets.py
```

| Tileset no Tiled/Phaser | PNG | Grade / tamanho |
| --- | --- | --- |
| `GoblinCave` | `goblin-cave-16x16.png` | 16 × 16; atlas 128 × 32 |
| `GoblinProps` | `goblin-props-16x16.png` | 16 × 16; atlas 256 × 256 |

`goblin-prefabs.json` descreve os 15 grupos de tiles: coordenadas no atlas,
largura, altura, recorte original e indicação de solidez. No Tiled, selecione
o retângulo completo do prefab para pintar os objetos.
Nenhum tileset ou GID antigo foi substituído.

São reutilizadas `Floor`, `Water`, `Walls`, `Details`, `Props`, `Traps`,
`Doors`, `Fire`, `Collision` e `Gameplay`. A fogueira e o braseiro usam o
blending aditivo existente de `Fire`; a poça usa `Water`.

## Regiões e orçamento de inimigos

Em `Gameplay`, dois Rectangle Objects têm `type=region`, propriedade string
`region` e propriedade int `enemyBudget`:

| Região | Retângulo em pixels do TMJ | Orçamento | Pool |
| --- | --- | --- | --- |
| `catacombs` | 0, 0, 1344, 928 | 36 | Goblin, Skeleton Warrior e Zombie existentes |
| `goblin_den` | 1344, 0, 576, 928 | 14 | Apenas Goblin existente |

As salas `type=room` também recebem `region`. `enemyWeight` controla a
distribuição proporcional do orçamento; `combat=false` exclui uma sala.
No covil, pesos 1, 1 e 2 geram respectivamente **4, 3 e 7 Goblins**.
O gerador não exige nove salas nem 36 inimigos como total global.
`REGION_ENEMY_POOLS` no gerador define os tipos permitidos.

`DungeonRegion.ts` define os IDs e a configuração regional do runtime.
`TilemapDungeon.getRegionAt(x, y)` recebe coordenadas do mundo (escala 3)
e testa os dois retângulos; retorna o ID ou `null` fora do mapa.
`DungeonScene.getPlayerRegion()` consulta a posição atual quando necessário,
sem varrer tiles a cada frame. Os pontos `EnemySpawns` carregam `region`,
validada contra sua posição e pool ao carregar.

O sorteio seguro mantém os inimigos realocados em sua região de origem,
inclusive nas ondas seguintes. Jogador, chave e portal continuam sorteados
entre posições livres e alcançáveis das catacumbas, mantendo a distância
mínima de 11 tiles entre jogador e inimigos. O runtime calcula os candidatos
sobre o piso livre; os nove `ExitGates` gerados são marcadores validados de
compatibilidade, não uma limitação do sorteio atual.

## Collision e VisionBlockers

`Collision` permanece a fonte física: exterior, paredes naturais, bases de
tendas, rochas grandes, paliçadas, caixas, barris, mesa e estandartes são
sólidos. As bases ocupam uma ou duas linhas; o desenho superior fica livre.
Ossos, cogumelos e pequenos suprimentos decorativos não recebem colisão.

`VisionBlockers` continua gerada a partir da colisão da fonte, incluindo
paredes, rochas grandes, tendas e mesa do covil. Os marcadores
`type=obstacle` em `Gameplay` documentam suas bases e a propriedade `blocksVision`.
Bandeiras, caixas, barris, paliçadas e braseiro usam `blocksVision=false`:
mantêm a colisão física, mas permitem enxergar através deles. A fogueira também
permite visão livre. A poça lateral é física e não projeta sombra.
A regra antiga dos props CraftPix foi mantida: suas colisões são adicionadas
depois da cópia de visão, sem novos bloqueios visuais nas catacumbas.
Os mesmos corpos estáticos atendem jogador, inimigos e projéteis.

## Como ampliar depois

1. Pinte a arquitetura nas camadas existentes, mantendo caminhos largos para
   os corpos físicos. Redimensione o mapa pelo Tiled se precisar.
2. Pinte `Collision` no exterior e nas bases sólidas; deixe corredores livres.
3. Amplie o retângulo `region=goblin_den` para cobrir a área nova, sem sobrepor
   `catacombs`. Cadastre salas `type=room`, `region=goblin_den`, `enemyWeight`
   positivo; use `combat=false` nas salas decorativas.
4. Ajuste `enemyBudget` no objeto da região para aumentar o total, se desejado.
   Adicionar salas apenas redistribui o orçamento atual.
5. Para exceções de visão, use retângulos técnicos com `blocksVision=false`.
   Os marcadores documentais de obstáculos não pintam colisão sozinhos.
6. Salve a fonte, execute o gerador e o build. Câmera e física acompanham
   automaticamente as dimensões do mapa.

## Arquivos desta implementação

Criados: `assets-source/goblin-den/{goblin-cave-source,goblin-props-source}.png`,
os dois atlas `goblin-*-16x16.png`, `goblin-prefabs.json`,
`scripts/prepare_goblin_den_assets.py`, `scripts/test_dungeon_map.py` e
`src/game/dungeon/DungeonRegion.ts`.

Alterados: os TMJs fonte/runtime, `scripts/generate_dungeon_map.py`,
`src/game/config/dungeonAssets.ts`, `src/game/dungeon/TilemapDungeon.ts`,
`src/game/dungeon/spawnPlacement.ts`, `src/game/scenes/DungeonScene.ts`,
`src/game/types/enemy.ts`, este guia, `ASSET_NOTES.md`, `README.md` e `.gitignore`.

## Validação da entrega

- Fonte lida e reexportada pelo Tiled 1.8.2 em modo offscreen, com todos os
  dados de tiles e 14 tilesets preservados; PNGs carregados no Phaser.
- Comparação com a fonte anterior confirmou alterações apenas na entrada.
  Todo piso transitável está conectado ao ponto inicial.
- Chromium: travessia física da entrada nos dois sentidos, regiões corretas,
  colisões de jogador/inimigo/flecha e funcionamento do sistema de visão.
- 150 sorteios simulados mantiveram segurança e região dos inimigos;
  nenhum Skeleton/Zombie foi colocado no covil. Objetivos ficaram nas catacumbas.
- Bounds da câmera e física confirmados em 5760 × 2784; inspeção visual do covil.
- Gerador: 120 × 58, 15 salas (11 anteriores + 4 novas), 50 inimigos,
  3 baús, 1 chave e 9 marcadores de saída.
- Teste com duas salas de combate no covil e orçamento 10 gerou 46 inimigos,
  confirmando que salas e orçamento são variáveis.
- `python3 scripts/test_dungeon_map.py` e `npm run build`: aprovados.
  O Vite mantém seu aviso de bundle JavaScript acima de 500 kB.
