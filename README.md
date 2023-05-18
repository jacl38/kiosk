# Kiosk Project
This is my capstone project for the Bachelor's in Software Engineering program at Western Governors University. The objective was to create a full-stack web application.

### The product
The product is a self-order kiosk system for a fictional bakery, "Breaking Bread." There are three main components to the system:
- A customer-facing page, where customers can place their orders on a tablet screen in the store.
- An order screen page, where bakery workers can view pending order details, prepare it, and cash out the customers.
- A management page, where the bakery managers can edit the menu items and run reports based on past orders.

## Images
### Kiosk page
|![menu screen](images/menu%20screen.png)|![search screen](images/search%20screen.png)|
|-|-|
|![order screen](images/add%20item%20screen.png)|![checkout screen](images/checkout%20screen.png)|

### Manager page
![menu customization](images/menu%20customization.png)

|![item edit](images/item%20edit.png)|![manager reports](images/manager%20reports.png)|
|-|-|

### The technology
This project relies mainly on [Next.js](https://nextjs.org/) for both the frontend and backend elements, and (MongoDB)[https://www.mongodb.com/] for the database. I used Next for the ability to easily consolidate frontend (React) and backend code into one codebase, and its ease-of-deployment on [Vercel](https://vercel.com/).

I used [Tailwind CSS](https://tailwindcss.com/) for page styling, and [Framer Motion](https://www.framer.com/motion/) for animations.

### Test it out
For testing purposes, you can use the username "admin" and the password "Password1". This will let you log into the management panel, as well as access the Kiosk and Order screens. These screens are inaccessible unless you are logged in, or a device is connected through the device tab in the management panel.