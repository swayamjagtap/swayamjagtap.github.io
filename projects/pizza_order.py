print("Welcome to Python Pizza Deliveries!")
size = input("What size pizza do you want? S, M or L: ").lower()
pepperoni = input("Do you want pepperoni on your pizza? Y or N: ").lower()
extra_cheese = input("Do you want extra cheese? Y or N: ").lower()
bill = 0

if size == 's':
    bill += 15
elif size == 'm':
    bill += 20
elif size == 'l':
    bill += 25
else:
    print("enter values S,M or L")

if pepperoni == 'y' and size == 's':
    bill += 2
elif pepperoni == 'y' and size == 'm' or size == 'l':
    bill += 3
else:
    print(f"you opted for no pepperoni.")

if extra_cheese == 'y':
    bill += 1
else:
    print(f"You opted for no extra cheese.")

print(f"Your final bill is {bill}")