import random

print("Welcome to the PyPassword Generator!")
nr_letters = int(input("How many letters would you like in your password?: "))
nr_symbols = int(input("How many symbols would you like?: "))
nr_numbers = int(input("How many numbers would you like?: "))

def password_generator(num_of_letters, num_of_symbols, num_of_numbers):
    letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    symbols = ['!', '#', '$', '%', '&', '(', ')', '*', '+']
    list_of_letters = []
    list_of_symbols = []
    list_of_numbers = []

    for i in range(num_of_letters):
        list_of_letters.append(random.choice(letters))

    for i in range(num_of_symbols):
        list_of_symbols.append(random.choice(symbols))

    for i in range(num_of_numbers):
        list_of_numbers.append(random.choice(numbers))

    list_of_elements = list_of_letters + list_of_symbols + list_of_numbers
    random.shuffle(list_of_elements)
    suggestion = ""
    for i in list_of_elements:
        suggestion += i
    print('')
    print(f"Here's a suggestion for password with {nr_letters} letters, {nr_symbols} symbols, {nr_numbers} numbers: {suggestion}")

password_generator(nr_letters, nr_symbols, nr_numbers)

response = input("Do you want another suggestion?(Y for yes N for no): ").strip().lower()
while response == 'y':
    password_generator(nr_letters, nr_symbols, nr_numbers)
    response = input("Do you want another suggestion?(Y for yes or press any key for no): ").strip().lower()

print("Thankyou for using our generator.")