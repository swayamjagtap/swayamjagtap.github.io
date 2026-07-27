print(f"Welcome to tip calculator")
bill_amt = float(input("Enter the bill amount: ₹"))
tip_percentage = float(input("Enter the percentage of tip you would like to give: "))
number_of_people = int(input("How many people to split the bill: "))

tip = (tip_percentage/100)*bill_amt
total_amt = tip+bill_amt
per_head_cost = total_amt/number_of_people
print(f"Amount ₹{round(per_head_cost,2)} is the split btwn {number_of_people} people for total amt:₹{total_amt}, out of which tip is:₹{tip} ")