import tkinter as tk

def change_light(active_color):
    # Set the active light to its color and turn the others grey.
    red = "red" if active_color == "red" else "grey"
    yellow = "yellow" if active_color == "yellow" else "grey"
    green = "green" if active_color == "green" else "grey"
    canvas.itemconfig(red_light, fill=red)
    canvas.itemconfig(yellow_light, fill=yellow)
    canvas.itemconfig(green_light, fill=green)
    window.update()
 
window = tk.Tk()
window.title("Traffic Light Simulator")

canvas = tk.Canvas(window, width=200, height=400, bg="black")
canvas.pack()

# Create three lights placed vertically.
red_light = canvas.create_oval(50, 50, 150, 150, fill="grey")
yellow_light = canvas.create_oval(50, 160, 150, 260, fill="grey")
green_light = canvas.create_oval(50, 270, 150, 370, fill="grey")

# Initialize with the red light active.
change_light("red")

while True:
    color = input("Enter a color (red, yellow, green): ").lower()
    if color in ["red", "yellow", "green"]:
        change_light(color)
    else:
        print("Invalid input. Please enter 'red', 'yellow', or 'green'.")

window.mainloop()
