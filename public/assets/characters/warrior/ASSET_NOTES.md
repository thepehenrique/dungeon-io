# Guerreiro com espada e escudo

Sprites direcionais refeitos para manter a mesma linguagem visual e proporção do
arqueiro e do goblin do projeto. Existe exatamente uma espada na mão direita e
um escudo na mão esquerda em todos os estados e quadros.

- `Warrior_Shield_Walk.png`: caminhada com os dois itens empunhados, 6 quadros
  por direção
- `Warrior_Shield_Attack.png`: ataque somente com a espada e escudo mantido na
  guarda, 6 quadros por direção
- `Warrior_Shield_Block.png`: o mesmo e único escudo sai da guarda lateral,
  avança para a frente, bloqueia e retorna; a espada permanece na outra mão,
  6 quadros por direção

Na direção para cima, a frente do personagem corresponde ao topo da tela. Por
isso, durante o bloqueio, o escudo avança acima da cabeça em vez de aparecer
nas costas; a espada continua empunhada na mão direita.

Na caminhada para a direita, a espada fica à frente do personagem, no lado
direito da imagem, enquanto o escudo permanece na mão esquerda, visível no lado
oposto do corpo.

Cada arquivo possui grade `6 x 4`, células de `256 x 256` e linhas na ordem:
baixo, esquerda, direita e cima.

Os três arquivos usam fundo RGBA transparente e margem segura por célula para
evitar cortes e vazamento visual entre frames.

Os sprites foram gerados com ImageGen usando como referência o guerreiro nível 3
da CraftPix e o arqueiro existente. Os arquivos originais e sua licença continuam
nesta pasta como referência de origem visual.
