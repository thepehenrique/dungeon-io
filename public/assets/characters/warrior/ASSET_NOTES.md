# Guerreiro com espada e escudo

Sprites direcionais fornecidos no pacote `warrior_spritesheets(1).zip` e
normalizados para o contrato visual do projeto. Existe exatamente uma espada na
mão direita e um escudo na mão esquerda em todos os estados e quadros.

- `Warrior_Shield_Walk.png`: caminhada com os dois itens empunhados, 6 quadros
  por direção
- `Warrior_Shield_Attack.png`: ataque somente com a espada e escudo mantido na
  guarda, 6 quadros por direção
- `Warrior_Shield_Block.png`: o mesmo e único escudo avança para a guarda,
  recebe o impacto e retorna; a espada permanece na outra mão, 6 quadros por
  direção

Enquanto a defesa está pressionada, a animação avança até o quarto quadro e
mantém a pose de impacto. Ao soltar a defesa, o personagem retorna para a
animação de caminhada ou para o quadro parado da direção atual.

Cada arquivo possui grade `6 x 4`, células de `256 x 256` e linhas na ordem:
baixo, esquerda, direita e cima.

Os três arquivos usam fundo RGBA transparente. Resíduos translúcidos foram
removidos e os quadros com golpes amplos foram reposicionados ou reduzidos para
garantir margem segura, evitando cortes e vazamento entre células.

A escala visual foi ajustada para `0.275`. O corpo físico foi recalibrado para
manter aproximadamente o mesmo raio de colisão do guerreiro anterior, sem mudar
vida, dano, alcance, velocidade ou regras da habilidade de bloqueio.
