height = int(input("Enter your height in cm: "))
# num2 = int(input("Enter second number: "))
if height>=120:
    print("you can ride the rollercoaster")
    age = int(input("Enter your age: "))
    if age >=18:
        bill = 1200
        if age >= 45 and age <= 55:
            bill = 0
        print(f"please pay ₹{bill}")
    elif age>=12:
        bill = 700
        print(f"please pay ₹{bill}")
    else:
        bill = 500
        print(f"please pay ₹{bill}")
    if input("Do you wish to add photo costing another ₹300?? (yes/no): ") == "yes":
        bill += 300
        print(f"your total bill is {bill}")
    else:
        print(f"your total bill is {bill}")
else:
    print("sorry you have to grow taller to ride the rollercoaster")