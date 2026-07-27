print(r'''
*******************************************************************************
          |                   |                  |                     |
 _________|________________.=""_;=.______________|_____________________|_______
|                   |  ,-"_,=""     `"=.|                  |
|___________________|__"=._o`"-._        `"=.______________|___________________
          |                `"=._o`"=._      _`"=._                     |
 _________|_____________________:=._o "=._."_.-="'"=.__________________|_______
|                   |    __.--" , ; `"=._o." ,-"""-._ ".   |
|___________________|_._"  ,. .` ` `` ,  `"-._"-._   ". '__|___________________
          |           |o`"=._` , "` `; .". ,  "-._"-._; ;              |
 _________|___________| ;`-.o`"=._; ." ` '`."\ ` . "-._ /_______________|_______
|                   | |o ;    `"-.o`"=._``  '` " ,__.--o;   |
|___________________|_| ;     (#) `-.o `"=.`_.--"_o.-; ;___|___________________
____/______/______/___|o;._    "      `".o|o_.--"    ;o;____/______/______/____
/______/______/______/_"=._o--._        ; | ;        ; ;/______/______/______/_
____/______/______/______/__"=._o--._   ;o|o;     _._;o;____/______/______/____
/______/______/______/______/____"=._o._; | ;_.--"o.--"_/______/______/______/_
____/______/______/______/______/_____"=.o|o_.--""___/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/_____ /
*******************************************************************************
''')
print("Welcome to Treasure Island.")
print("Your mission is to find the treasure.")
left_right = input("Go Left? or Go Right?\n").strip().lower()
if left_right == 'left':
    print("Your have reached a river.")
    swim_wait = input("Do you wish to wait for a boat or swim across??\n").strip().lower()
    if swim_wait == 'wait':
        print("you have crossed the river.\nThere are three doors red, yellow, blue.")
        door = input("which door would you like to choose to continue your journey??\n").strip().lower()
        if door == 'yellow':
            print("congratulations! you won!")
        elif door == 'red':
            print("you died by arrows. try again.")
        elif door == 'blue':
            print("you died from poison gas. try again.")
        else:
            print("choose between 'red','yellow','blue' only.")
    else:
        print("you died. try again")
else:
    print("you died. try again")