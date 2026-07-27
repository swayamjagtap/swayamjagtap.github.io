rock = '''
    _______
---'   ____)
      (_____)
      (_____)
      (____)
---.__(___)
'''

paper = '''
    _______
---'   ____)____
          ______)
          _______)
         _______)
---.__________)
'''

scissors = '''
    _______
---'   ____)____
          ______)
       __________)
      (____)
---.__(___)
'''

import random

list_of_moves = [rock, paper, scissors]
comp_move = random.choice(list_of_moves)
# print(comp_move)
player_move = input(f"Rock, Paper, Scissors?\n").strip().lower()

if player_move == 'rock':
    if comp_move == rock:
        print("draw")
    elif comp_move == scissors:
        print("you won. computer played scissors")
    else:
        print("You lost. computer played paper")
elif player_move == 'paper':
    if comp_move== paper:
        print("draw")
    elif comp_move == rock:
        print("you won. computer played rock")
    else:
        print("You lost. computer played scissors")
elif player_move == 'scissors':
    if comp_move == scissors:
        print("draw")
    elif comp_move == paper:
        print("you won. computer played paper")
    else:
        print("You lost. computer played rock")
else:
    print("Choose from 'rock', 'paper', 'scissors' only.")